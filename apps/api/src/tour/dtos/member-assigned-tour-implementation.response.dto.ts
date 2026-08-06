import {
  embeddedOrganizationMemberQueryArgs,
  toEmbeddedOrganizationMemberResponse,
  type EmbeddedOrganizationMemberResponse,
} from 'src/organization/dtos/organization-member.response.dto';
import { Prisma } from 'src/prisma/generated/client';
import type { StorageService } from 'src/storage/storage.service';

import type { TourImplementationMeta } from './tour-implementation.response.dto';

export const memberAssignedTourImplementationQueryArgs = {
  select: {
    id: true,
    tourImplementationId: true,
    organizationMemberId: true,
    role: true,
    organizationMember: embeddedOrganizationMemberQueryArgs,
  },
} satisfies Prisma.MemberAssignedTourImplementationDefaultArgs;

type MemberAssignedTourImplementationPayload =
  Prisma.MemberAssignedTourImplementationGetPayload<
    typeof memberAssignedTourImplementationQueryArgs
  >;
export type MemberAssignedTourImplementationResponse = Omit<
  MemberAssignedTourImplementationPayload,
  'organizationMember'
> & {
  organizationMember: EmbeddedOrganizationMemberResponse | null;
};

export const toMemberAssignedTourImplementationResponse = (
  memberAssignedTourImplementation: MemberAssignedTourImplementationPayload,
  storageService: StorageService,
): MemberAssignedTourImplementationResponse => {
  const { organizationMember, ...memberAssignedTourImplementationRest } =
    memberAssignedTourImplementation;
  return {
    ...memberAssignedTourImplementationRest,
    organizationMember:
      organizationMember &&
      toEmbeddedOrganizationMemberResponse(organizationMember, storageService),
  };
};

export type MemberAssignedTourImplementationWithMeta =
  MemberAssignedTourImplementationResponse & { meta: TourImplementationMeta };
