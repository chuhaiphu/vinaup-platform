import { CarOperationalStatus } from 'src/_common/constants/car.constant';
import type { BaseMeta } from 'src/_common/interfaces/interface';
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

// ─── The trips a car carries: a narrow slice, not the whole trip ─────────────
export const carTripAssignmentQueryArgs = {
  select: {
    id: true,
    tripId: true,
    trip: {
      select: { id: true, description: true, startDate: true, endDate: true },
    },
  },
} satisfies Prisma.TripAssignmentDefaultArgs;

export type CarTripAssignmentResponse = Prisma.TripAssignmentGetPayload<
  typeof carTripAssignmentQueryArgs
>;

// The projection a car is EMBEDDED with — `trip.car`, `carAssignment.car`, …
export const embeddedCarQueryArgs = {
  select: {
    id: true,
    name: true,
    description: true,
    createdAt: true,
    updatedAt: true,
    createdByUserId: true,
    organizationId: true,
    status: true,
    featureImageKey: true,
    additionalImageKeys: true,
    youtubeUrl: true,
    manufacturer: true,
    model: true,
    seatCount: true,
    category: true,
    inServiceDate: true,
    bankMortgageAmount: true,
    fuelConsumption: true,
    fuelType: true,
    inspectionExpiryDate: true,
    roadFeeExpiryDate: true,
    insuranceExpiryDate: true,
    badgeExpiryDate: true,
  },
} satisfies Prisma.CarDefaultArgs;

// DB holds `featureImageKey` / `additionalImageKeys`; the wire exposes `featureImageUrl` /
// `additionalImageUrls` (StorageService.getPublicUrl).
type EmbeddedCarPayload = Prisma.CarGetPayload<typeof embeddedCarQueryArgs>;
export type EmbeddedCarResponse = Omit<
  EmbeddedCarPayload,
  'featureImageKey' | 'additionalImageKeys'
> & {
  featureImageUrl: string | null;
  additionalImageUrls: string[];
};

export const toEmbeddedCarResponse = (
  car: EmbeddedCarPayload,
  storageService: StorageService,
): EmbeddedCarResponse => {
  const { featureImageKey, additionalImageKeys, ...carRest } = car;
  return {
    ...carRest,
    featureImageUrl: featureImageKey ? storageService.getPublicUrl(featureImageKey) : null,
    additionalImageUrls: additionalImageKeys.map((key) => storageService.getPublicUrl(key)),
  };
};

// The car's own endpoints additionally expose its creator, organization, current
// assignments (each with the assigned member and that member's linked user), maintenance
// log and the trips it carries.
export const carQueryArgs = {
  select: {
    ...embeddedCarQueryArgs.select,
    createdBy: embeddedUserQueryArgs,
    organization: embeddedOrganizationQueryArgs,
    carAssignments: {
      select: {
        id: true,
        carId: true,
        organizationMemberId: true,
        note: true,
        startTime: true,
        createdAt: true,
        updatedAt: true,
        organizationMember: {
          select: { ...embeddedOrganizationMemberQueryArgs.select, user: embeddedUserQueryArgs },
        },
      },
    },
    carMaintenanceLog: true,
    tripAssignments: carTripAssignmentQueryArgs,
  },
} satisfies Prisma.CarDefaultArgs;

type CarPayload = Prisma.CarGetPayload<typeof carQueryArgs>;
type EmbeddedCarAssignmentPayload = CarPayload['carAssignments'][number];

export type EmbeddedCarAssignmentResponse = Omit<
  EmbeddedCarAssignmentPayload,
  'organizationMember'
> & {
  organizationMember: EmbeddedOrganizationMemberResponse & { user: EmbeddedUserResponse | null };
};

export type CarResponse = Omit<
  CarPayload,
  'featureImageKey' | 'additionalImageKeys' | 'createdBy' | 'organization' | 'carAssignments'
> & {
  featureImageUrl: string | null;
  additionalImageUrls: string[];
  createdBy: EmbeddedUserResponse | null;
  organization: EmbeddedOrganizationResponse;
  carAssignments: EmbeddedCarAssignmentResponse[];
};

export const toCarResponse = (car: CarPayload, storageService: StorageService): CarResponse => {
  const {
    featureImageKey,
    additionalImageKeys,
    createdBy,
    organization,
    carAssignments,
    ...carRest
  } = car;
  return {
    ...carRest,
    featureImageUrl: featureImageKey ? storageService.getPublicUrl(featureImageKey) : null,
    additionalImageUrls: additionalImageKeys.map((key) => storageService.getPublicUrl(key)),
    createdBy: createdBy && toEmbeddedUserResponse(createdBy, storageService),
    organization: toEmbeddedOrganizationResponse(organization, storageService),
    carAssignments: carAssignments.map((carAssignment) => {
      const { organizationMember, ...carAssignmentRest } = carAssignment;
      const { user, ...organizationMemberRest } = organizationMember;
      return {
        ...carAssignmentRest,
        organizationMember: {
          ...toEmbeddedOrganizationMemberResponse(organizationMemberRest, storageService),
          user: user && toEmbeddedUserResponse(user, storageService),
        },
      };
    }),
  };
};

export interface CarMeta extends BaseMeta {
  operationalStatus: CarOperationalStatus;
}

export type CarWithMeta = CarResponse & { meta: CarMeta };
