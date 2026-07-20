import { PrismaPg } from '@prisma/adapter-pg';
import {
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSION_ACTION,
  PERMISSION_RESOURCE,
} from '@vinaup-platform/permission';
import { hash, genSalt } from 'bcrypt';


import { AUTH_PROVIDER } from 'src/_common/constants/auth.constant';
import {
  ORGANIZATION_ROLE_CODE,
  ORGANIZATION_ROLE_DESCRIPTION,
} from 'src/_common/constants/organization.constant';

import { PrismaClient } from './generated/client';

const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter: pool });

const SYSTEM_RECEIPT_PAYMENT_CATEGORIES = [
  'Hoa hồng', 'Tạm ứng', 'Đặt cọc',
  'Hoàn ứng', 'Trả góp', 'Mượn nợ', 'Trả nợ',
];

const SYSTEM_ORGANIZATION_RECEIPT_PAYMENT_CATEGORIES = [
  'Khách sạn',
  'Vận chuyển',
  'Tham quan & ăn uống',
  'Dịch vụ chung',
  'Nhiên liệu & Sạc điện',
  'Thay nhớt & Bôi trơn',
  'Lọc & Bảo dưỡng định kỳ',
  'Hệ thống phanh',
  'Lốp & Bánh xe',
  'Làm mát & Điều hoà',
  'Điện & Ắc quy',
  'Rửa xe & Vệ sinh',
  'Phụ tùng & Sửa chữa',
  'Khác',
];

async function seedOrganizationIndustries() {
  console.log('Seeding organization industries...');

  const organizationIndustries = [
    { code: 'GENERAL', description: 'Tổng hợp' },
    { code: 'TOURISM', description: 'Du lịch' },
    { code: 'CAR_RENTAL', description: 'Xe cho thuê' },
  ];

  for (const industry of organizationIndustries) {
    await prisma.organizationIndustry.upsert({
      where: { code: industry.code },
      update: { description: industry.description },
      create: industry,
    });
  }

  console.log(
    `✅ Created/updated ${organizationIndustries.length} organization industries`
  );
}

async function seedInvoiceTypes() {
  console.log('Seeding invoice types...');

  const invoiceTypes = [
    { code: 'SELL', description: 'Bán hàng' },
    { code: 'BUY', description: 'Mua hàng' },
  ];

  for (const type of invoiceTypes) {
    await prisma.invoiceType.upsert({
      where: { code: type.code },
      update: { description: type.description },
      create: type,
    });
  }

  console.log(`✅ Created/updated ${invoiceTypes.length} invoice types`);
}

async function seedOrganizationPermissions() {
  console.log('Seeding organization permissions...');

  // The grantable catalog: CRUD on every granular resource, plus the single MANAGE/ALL wildcard
  // OWNER is locked to. Resources/actions come from @vinaup-platform/permission (UPPER_SNAKE).
  const crudActions = [
    PERMISSION_ACTION.CREATE,
    PERMISSION_ACTION.READ,
    PERMISSION_ACTION.UPDATE,
    PERMISSION_ACTION.DELETE,
  ];
  const granularResources = Object.values(PERMISSION_RESOURCE).filter(
    (resource) => resource !== PERMISSION_RESOURCE.ALL,
  );

  const cells: { resource: string; action: string }[] = [
    { resource: PERMISSION_RESOURCE.ALL, action: PERMISSION_ACTION.MANAGE },
    ...granularResources.flatMap((resource) =>
      crudActions.map((action) => ({ resource, action })),
    ),
  ];

  for (const cell of cells) {
    await prisma.organizationPermission.upsert({
      where: { resource_action: { resource: cell.resource, action: cell.action } },
      update: {},
      create: cell,
    });
  }

  console.log(`✅ Created/updated ${cells.length} organization permissions`);
}

async function seedUsersAndOrganization() {
  console.log('Seeding users and organization...');

  const password = await hash('vietna', await genSalt());

  const industry = await prisma.organizationIndustry.findFirst();
  if (!industry) {
    console.log('Missing industry, skipping user seed.');
    return;
  }

  const allPermissions = await prisma.organizationPermission.findMany();

  async function createFullUser(email: string, name: string, phone: string) {
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({ data: { email, name, phone } });
      await prisma.user.update({
        where: { id: user.id },
        data: { createdByUserId: user.id },
      });
      await prisma.auth.create({
        data: { provider: AUTH_PROVIDER.LOCAL, providerId: email, passwordHash: password, userId: user.id },
      });
    }
    await prisma.receiptPaymentCategory.createMany({
      data: SYSTEM_RECEIPT_PAYMENT_CATEGORIES.map((name) => ({
        name,
        userId: user.id,
        isSystem: true,
      })),
      skipDuplicates: true,
    });
    return user;
  }

  async function createOrganizationWithMembers(config: {
    orgName: string;
    orgEmail: string;
    orgPhone: string;
    orgAddress: string;
    ownerEmail: string;
    ownerName: string;
    ownerPhone: string;
    members: { email: string; name: string; phone: string }[];
  }) {
    const ownerUser = await createFullUser(config.ownerEmail, config.ownerName, config.ownerPhone);

    let organization = await prisma.organization.findFirst({
      where: { createdByUserId: ownerUser.id, name: config.orgName },
    });

    if (organization) {
      console.log(`Organization "${config.orgName}" already exists, skipping.`);
      console.log(`Org ID: ${organization.id}`);
      return;
    }

    organization = await prisma.organization.create({
      data: {
        name: config.orgName,
        email: config.orgEmail,
        phone: config.orgPhone,
        address: config.orgAddress,
        province: 'Seed City',
        organizationIndustryId: industry!.id,
        createdByUserId: ownerUser.id,
      },
    });

    // Seed the factory-default roles from the matrix (@vinaup-platform/permission):
    // OWNER locked to MANAGE ALL, MEMBER read-only.
    const roleMap = new Map<string, string>();
    for (const [code, cells] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
      const permissionIds = cells.map((cell) => {
        const permission = allPermissions.find(
          (p) => p.resource === cell.resource && p.action === cell.action,
        );
        if (!permission) {
          throw new Error(`Missing OrganizationPermission for ${cell.action} ${cell.resource}`);
        }
        return permission.id;
      });

      const role = await prisma.organizationRole.create({
        data: {
          organizationId: organization.id,
          code,
          description: ORGANIZATION_ROLE_DESCRIPTION[code] ?? code,
          organizationRolePermissions: {
            create: permissionIds.map((organizationPermissionId) => ({ organizationPermissionId })),
          },
        },
      });
      roleMap.set(code, role.id);
    }

    // Add owner as member
    await prisma.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: ownerUser.id,
        type: 'FULL_TIME',
        name: ownerUser.name,
        email: ownerUser.email,
        phone: ownerUser.phone || '',
        status: 'ACTIVE',
        joinedAt: new Date(),
        createdByUserId: ownerUser.id,
        organizationRoleId: roleMap.get(ORGANIZATION_ROLE_CODE.OWNER)!,
      },
    });

    // Add 3 members
    for (const m of config.members) {
      const memberUser = await createFullUser(m.email, m.name, m.phone);
      const existingMember = await prisma.organizationMember.findFirst({
        where: { organizationId: organization.id, userId: memberUser.id },
      });
      if (!existingMember) {
        await prisma.organizationMember.create({
          data: {
            organizationId: organization.id,
            userId: memberUser.id,
            type: 'FULL_TIME',
            name: memberUser.name,
            email: memberUser.email,
            phone: memberUser.phone || '',
            status: 'ACTIVE',
            joinedAt: new Date(),
            createdByUserId: ownerUser.id,
            organizationRoleId: roleMap.get(ORGANIZATION_ROLE_CODE.MEMBER)!,
          },
        });
      }
    }

    // Default customer
    const existingDefaultCustomer = await prisma.organizationCustomer.findFirst({
      where: { organizationId: organization.id, isSystemDefault: true },
    });
    if (!existingDefaultCustomer) {
      await prisma.organizationCustomer.create({
        data: {
          organizationId: organization.id,
          name: 'Khách lẻ',
          phone: organization.phone,
          status: 'ACTIVE',
          joinedAt: new Date(),
          isSystemDefault: true,
          createdByUserId: ownerUser.id,
        },
      });
    }

    // Default receipt payment categories
    await prisma.receiptPaymentCategory.createMany({
      data: SYSTEM_ORGANIZATION_RECEIPT_PAYMENT_CATEGORIES.map((name) => ({
        name,
        organizationId: organization.id,
        isSystem: true,
      })),
      skipDuplicates: true,
    });

    console.log(`✅ Seeded "${config.orgName}" (ID: ${organization.id}) — 1 owner + ${config.members.length} members`);
  }

  await createOrganizationWithMembers({
    orgName: 'Seed Organization',
    orgEmail: 'org@seed.com',
    orgPhone: '0901234567',
    orgAddress: '123 Seed Street',
    ownerEmail: 'vinaup@seed.com',
    ownerName: 'VinaUp Seed',
    ownerPhone: '0901234567',
    members: [
      { email: 'member1@seed.com', name: 'Member One', phone: '0901111111' },
      { email: 'member2@seed.com', name: 'Member Two', phone: '0902222222' },
      { email: 'member3@seed.com', name: 'Member Three', phone: '0903333333' },
    ],
  });

  await createOrganizationWithMembers({
    orgName: 'Seed Organization 2',
    orgEmail: 'org2@seed.com',
    orgPhone: '0907654321',
    orgAddress: '456 Seed Street',
    ownerEmail: 'vinaup2@seed.com',
    ownerName: 'VinaUp Seed 2',
    ownerPhone: '0907654321',
    members: [
      { email: 'member4@seed.com', name: 'Member Four', phone: '0904444444' },
      { email: 'member5@seed.com', name: 'Member Five', phone: '0905555555' },
      { email: 'member6@seed.com', name: 'Member Six', phone: '0906666666' },
    ],
  });
}

async function main() {
  console.log('Start seeding...');

  await seedOrganizationIndustries();
  await seedInvoiceTypes();
  await seedOrganizationPermissions();
  await seedUsersAndOrganization();

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
