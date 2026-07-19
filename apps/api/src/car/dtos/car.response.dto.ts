import { CarOperationalStatus } from 'src/_common/constants/car.constant';
import { BaseMeta } from 'src/_common/interfaces/interface';
import { CarAssignment, CarMaintenanceLog, Organization, User } from 'src/prisma/generated/client';

export class CarResponse {
  id!: string;
  name!: string | null;
  manufacturer!: string | null;
  model!: string | null;
  seatCount!: number | null;
  category!: string | null;
  description!: string | null;
  status!: string;
  featureImageUrl!: string | null;
  youtubeUrl!: string | null;
  additionalImageUrls!: string[];
  inServiceDate!: Date | null;
  bankMortgageAmount!: number | null;
  fuelConsumption!: number | null;
  fuelType!: string | null;
  inspectionExpiryDate!: Date | null;
  roadFeeExpiryDate!: Date | null;
  insuranceExpiryDate!: Date | null;
  badgeExpiryDate!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
  createdBy!: User | null;
  organization!: Organization;
  carAssignments?: CarAssignment[];
  carMaintenanceLog?: CarMaintenanceLog | null;
}

export interface CarMeta extends BaseMeta {
  operationalStatus: CarOperationalStatus;
}

export type CarWithMeta = CarResponse & { meta: CarMeta };
