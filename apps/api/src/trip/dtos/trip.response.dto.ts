import {
  embeddedCarQueryArgs,
  toEmbeddedCarResponse,
  type EmbeddedCarResponse,
} from 'src/car/dtos/car.response.dto';
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

export const tripQueryArgs = {
  include: {
    createdBy: embeddedUserQueryArgs,
    organization: embeddedOrganizationQueryArgs,
    organizationCustomer: true,
  },
} satisfies Prisma.TripDefaultArgs;

// ─── List variant: embed assignments so each list card can summarise drivers + cars ─────
export const tripListQueryArgs = {
  include: {
    ...tripQueryArgs.include,
    tripAssignments: {
      include: {
        car: embeddedCarQueryArgs,
        members: { include: { organizationMember: embeddedOrganizationMemberQueryArgs } },
      },
    },
  },
} satisfies Prisma.TripDefaultArgs;

type TripPayload = Prisma.TripGetPayload<typeof tripQueryArgs>;
type TripListPayload = Prisma.TripGetPayload<typeof tripListQueryArgs>;
type EmbeddedTripAssignmentPayload = TripListPayload['tripAssignments'][number];
type EmbeddedTripAssignmentMemberPayload = EmbeddedTripAssignmentPayload['members'][number];

export type EmbeddedTripAssignmentResponse = Omit<EmbeddedTripAssignmentPayload, 'car' | 'members'> & {
  car: EmbeddedCarResponse | null;
  members: (Omit<EmbeddedTripAssignmentMemberPayload, 'organizationMember'> & {
    organizationMember: EmbeddedOrganizationMemberResponse;
  })[];
};

// Only the list endpoint embeds assignments; detail/create/update omit them, hence optional.
export type TripResponse = Omit<TripPayload, 'createdBy' | 'organization'> & {
  createdBy: EmbeddedUserResponse | null;
  organization: EmbeddedOrganizationResponse;
  tripAssignments?: EmbeddedTripAssignmentResponse[];
};

const toEmbeddedTripAssignmentResponse = (
  tripAssignment: EmbeddedTripAssignmentPayload,
  storageService: StorageService,
): EmbeddedTripAssignmentResponse => {
  const { car, members, ...tripAssignmentRest } = tripAssignment;
  return {
    ...tripAssignmentRest,
    car: car && toEmbeddedCarResponse(car, storageService),
    members: members.map((member) => {
      const { organizationMember, ...memberRest } = member;
      return {
        ...memberRest,
        organizationMember: toEmbeddedOrganizationMemberResponse(
          organizationMember,
          storageService,
        ),
      };
    }),
  };
};

export const toTripResponse = (
  trip: TripPayload & { tripAssignments?: EmbeddedTripAssignmentPayload[] },
  storageService: StorageService,
): TripResponse => {
  const { createdBy, organization, tripAssignments, ...tripRest } = trip;
  return {
    ...tripRest,
    createdBy: createdBy && toEmbeddedUserResponse(createdBy, storageService),
    organization: toEmbeddedOrganizationResponse(organization, storageService),
    ...(tripAssignments && {
      tripAssignments: tripAssignments.map((tripAssignment) =>
        toEmbeddedTripAssignmentResponse(tripAssignment, storageService),
      ),
    }),
  };
};
