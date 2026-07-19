import { OrganizationMember } from 'src/prisma/generated/client';

import { TourImplementationMeta } from './tour-implementation.response.dto';

export class MemberAssignedTourImplementationResponse {
  id!: string;
  tourImplementationId!: string | null;
  organizationMemberId!: string | null;
  organizationMember!: OrganizationMember | null;
  role!: string;
}

export type MemberAssignedTourImplementationWithMeta =
  MemberAssignedTourImplementationResponse & { meta: TourImplementationMeta };
