import { Car, OrganizationMember } from 'src/prisma/generated/client';

export class CarAssignmentResponse {
  id!: string;
  carId!: string;
  car!: Car;
  organizationMemberId!: string;
  organizationMember!: OrganizationMember;
  startTime!: Date;
  note!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
