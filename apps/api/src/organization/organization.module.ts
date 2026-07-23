import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';

import { OrganizationCustomerController } from './controllers/organization-customer.controller';
import { OrganizationMemberController } from './controllers/organization-member.controller';
import { OrganizationPermissionController } from './controllers/organization-permission.controller';
import { OrganizationRoleController } from './controllers/organization-role.controller';
import { OrganizationController } from './controllers/organization.controller';
import { OrganizationCustomerService } from './services/organization-customer.service';
import { OrganizationMemberService } from './services/organization-member.service';
import { OrganizationPermissionService } from './services/organization-permission.service';
import { OrganizationRoleService } from './services/organization-role.service';
import { OrganizationService } from './services/organization.service';

@Module({
  imports: [
    // ─── PrismaModule: make PrismaService injectable in this module ───────────────
    // The organization services below inject PrismaService for DB access. DI only
    // resolves a dependency whose provider is visible in THIS module's scope — without
    // this import, building the services would fail at startup.
    PrismaModule,
    AuthModule,
    // ─── ValidatorsModule: register the custom request-DTO validators ───
    ],
  controllers: [
    OrganizationController,
    OrganizationCustomerController,
    OrganizationMemberController,
    OrganizationPermissionController,
    OrganizationRoleController,
  ],
  providers: [
    OrganizationService,
    OrganizationCustomerService,
    OrganizationMemberService,
    OrganizationPermissionService,
    OrganizationRoleService,
  ],
})
export class OrganizationModule {}
