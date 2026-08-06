import { Prisma } from 'src/prisma/generated/client';
import type { StorageService } from 'src/storage/storage.service';
import {
  toEmbeddedUserResponse,
  embeddedUserQueryArgs,
  type EmbeddedUserResponse,
} from 'src/user/dtos/user.response.dto';

import {
  embeddedOrganizationQueryArgs,
  toEmbeddedOrganizationResponse,
  type EmbeddedOrganizationResponse,
} from './organization.response.dto';

// The projection a member is EMBEDDED with — `carAssignment.organizationMember`, attendance, …
export const embeddedOrganizationMemberQueryArgs = {
  select: {
    id: true,
    organizationId: true,
    type: true,
    name: true,
    email: true,
    phone: true,
    address: true,
    avatarKey: true,
    status: true,
    joinedAt: true,
    createdByUserId: true,
    userId: true,
    organizationRoleId: true,
  },
} satisfies Prisma.OrganizationMemberDefaultArgs;

// DB holds `avatarKey`; the wire exposes `avatarUrl` (StorageService.getPublicUrl).
type EmbeddedOrganizationMemberPayload = Prisma.OrganizationMemberGetPayload<
  typeof embeddedOrganizationMemberQueryArgs
>;
export type EmbeddedOrganizationMemberResponse = Omit<
  EmbeddedOrganizationMemberPayload,
  'avatarKey'
> & {
  avatarUrl: string | null;
};

export const toEmbeddedOrganizationMemberResponse = (
  organizationMember: EmbeddedOrganizationMemberPayload,
  storageService: StorageService,
): EmbeddedOrganizationMemberResponse => {
  const { avatarKey, ...organizationMemberRest } = organizationMember;
  return {
    ...organizationMemberRest,
    avatarUrl: avatarKey ? storageService.getPublicUrl(avatarKey) : null,
  };
};

// The member's own endpoints additionally expose the linked user, organization and role.
export const organizationMemberQueryArgs = {
  select: {
    ...embeddedOrganizationMemberQueryArgs.select,
    createdBy: embeddedUserQueryArgs,
    user: embeddedUserQueryArgs,
    organization: embeddedOrganizationQueryArgs,
    organizationRole: true,
  },
} satisfies Prisma.OrganizationMemberDefaultArgs;

type OrganizationMemberPayload = Prisma.OrganizationMemberGetPayload<
  typeof organizationMemberQueryArgs
>;
export type OrganizationMemberResponse = Omit<
  OrganizationMemberPayload,
  'avatarKey' | 'createdBy' | 'user' | 'organization'
> & {
  avatarUrl: string | null;
  createdBy: EmbeddedUserResponse | null;
  user: EmbeddedUserResponse | null;
  organization: EmbeddedOrganizationResponse;
};

export const toOrganizationMemberResponse = (
  organizationMember: OrganizationMemberPayload,
  storageService: StorageService,
): OrganizationMemberResponse => {
  const { avatarKey, createdBy, user, organization, ...organizationMemberRest } =
    organizationMember;
  return {
    ...organizationMemberRest,
    avatarUrl: avatarKey ? storageService.getPublicUrl(avatarKey) : null,
    createdBy: createdBy && toEmbeddedUserResponse(createdBy, storageService),
    user: user && toEmbeddedUserResponse(user, storageService),
    organization: toEmbeddedOrganizationResponse(organization, storageService),
  };
};
