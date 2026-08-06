import { Prisma } from 'src/prisma/generated/client';
import type { StorageService } from 'src/storage/storage.service';
import {
  toEmbeddedUserResponse,
  embeddedUserQueryArgs,
  type EmbeddedUserResponse,
} from 'src/user/dtos/user.response.dto';

// The projection an organization is EMBEDDED with — `booking.organization`, `car.organization`, …
export const embeddedOrganizationQueryArgs = {
  select: {
    id: true,
    name: true,
    description: true,
    email: true,
    phone: true,
    address: true,
    website: true,
    avatarKey: true,
    province: true,
    timezone: true,
    createdAt: true,
    updatedAt: true,
    createdByUserId: true,
    organizationIndustryId: true,
  },
} satisfies Prisma.OrganizationDefaultArgs;

// DB holds `avatarKey`; the wire exposes `avatarUrl` (StorageService.getPublicUrl).
type EmbeddedOrganizationPayload = Prisma.OrganizationGetPayload<
  typeof embeddedOrganizationQueryArgs
>;
export type EmbeddedOrganizationResponse = Omit<EmbeddedOrganizationPayload, 'avatarKey'> & {
  avatarUrl: string | null;
};

export const toEmbeddedOrganizationResponse = (
  organization: EmbeddedOrganizationPayload,
  storageService: StorageService,
): EmbeddedOrganizationResponse => {
  const { avatarKey, ...organizationRest } = organization;
  return {
    ...organizationRest,
    avatarUrl: avatarKey ? storageService.getPublicUrl(avatarKey) : null,
  };
};

// The organization's own endpoints additionally expose its creator and its industry.
export const organizationQueryArgs = {
  select: {
    ...embeddedOrganizationQueryArgs.select,
    createdBy: embeddedUserQueryArgs,
    organizationIndustry: true,
  },
} satisfies Prisma.OrganizationDefaultArgs;

// The member counts are computed server-side, so they extend the derived type.
type OrganizationPayload = Prisma.OrganizationGetPayload<typeof organizationQueryArgs>;
export type OrganizationResponse = Omit<OrganizationPayload, 'avatarKey' | 'createdBy'> & {
  avatarUrl: string | null;
  createdBy: EmbeddedUserResponse | null;
  memberCount?: number;
  memberLinkedCount?: number;
};

export const toOrganizationResponse = (
  organization: OrganizationPayload,
  storageService: StorageService,
): OrganizationResponse => {
  const { avatarKey, createdBy, ...organizationRest } = organization;
  return {
    ...organizationRest,
    avatarUrl: avatarKey ? storageService.getPublicUrl(avatarKey) : null,
    createdBy: createdBy && toEmbeddedUserResponse(createdBy, storageService),
  };
};
