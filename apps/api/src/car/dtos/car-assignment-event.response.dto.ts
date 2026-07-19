export class CarAssignmentEventResponse {
  id!: string;
  carId!: string;
  operationId!: string;
  action!: string;
  organizationMemberId!: string | null;
  memberName!: string;
  memberAvatarUrl!: string | null;
  note!: string | null;
  performedAt!: Date;
  createdAt!: Date;
}
