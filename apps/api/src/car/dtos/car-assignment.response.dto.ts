import {
  embeddedOrganizationMemberQueryArgs,
  toEmbeddedOrganizationMemberResponse,
  type EmbeddedOrganizationMemberResponse,
} from 'src/organization/dtos/organization-member.response.dto';
import {
  embeddedOrganizationQueryArgs,
  toEmbeddedOrganizationResponse,
  type EmbeddedOrganizationResponse,
} from 'src/organization/dtos/organization.response.dto';
import { Prisma } from 'src/prisma/generated/client';
import type { StorageService } from 'src/storage/storage.service';
import {
  toEmbeddedUserResponse,
  embeddedUserQueryArgs,
  type EmbeddedUserResponse,
} from 'src/user/dtos/user.response.dto';

import {
  embeddedCarQueryArgs,
  toEmbeddedCarResponse,
  type EmbeddedCarResponse,
} from './car.response.dto';

// ─── A state row always ships its car + member (with user + organization)
export const carAssignmentQueryArgs = {
  include: {
    car: embeddedCarQueryArgs,
    organizationMember: {
      select: {
        ...embeddedOrganizationMemberQueryArgs.select,
        user: embeddedUserQueryArgs,
        organization: embeddedOrganizationQueryArgs,
      },
    },
  },
} satisfies Prisma.CarAssignmentDefaultArgs;

type CarAssignmentPayload = Prisma.CarAssignmentGetPayload<typeof carAssignmentQueryArgs>;

export type CarAssignmentResponse = Omit<CarAssignmentPayload, 'car' | 'organizationMember'> & {
  car: EmbeddedCarResponse;
  organizationMember: EmbeddedOrganizationMemberResponse & {
    user: EmbeddedUserResponse | null;
    organization: EmbeddedOrganizationResponse;
  };
};

export const toCarAssignmentResponse = (
  carAssignment: CarAssignmentPayload,
  storageService: StorageService,
): CarAssignmentResponse => {
  const { car, organizationMember, ...carAssignmentRest } = carAssignment;
  const { user, organization, ...organizationMemberRest } = organizationMember;
  return {
    ...carAssignmentRest,
    car: toEmbeddedCarResponse(car, storageService),
    organizationMember: {
      ...toEmbeddedOrganizationMemberResponse(organizationMemberRest, storageService),
      user: user && toEmbeddedUserResponse(user, storageService),
      organization: toEmbeddedOrganizationResponse(organization, storageService),
    },
  };
};
