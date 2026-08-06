import { Prisma } from 'src/prisma/generated/client';
import type { StorageService } from 'src/storage/storage.service';

export const carAssignmentEventQueryArgs = {
  select: {
    id: true,
    carId: true,
    operationId: true,
    action: true,
    organizationMemberId: true,
    memberName: true,
    memberAvatarKey: true,
    note: true,
    performedAt: true,
    createdAt: true,
  },
} satisfies Prisma.CarAssignmentEventDefaultArgs;

type CarAssignmentEventPayload = Prisma.CarAssignmentEventGetPayload<
  typeof carAssignmentEventQueryArgs
>;
export type CarAssignmentEventResponse = Omit<CarAssignmentEventPayload, 'memberAvatarKey'> & {
  memberAvatarUrl: string | null;
};

export const toCarAssignmentEventResponse = (
  carAssignmentEvent: CarAssignmentEventPayload,
  storageService: StorageService,
): CarAssignmentEventResponse => {
  const { memberAvatarKey, ...carAssignmentEventRest } = carAssignmentEvent;
  return {
    ...carAssignmentEventRest,
    memberAvatarUrl: memberAvatarKey ? storageService.getPublicUrl(memberAvatarKey) : null,
  };
};
