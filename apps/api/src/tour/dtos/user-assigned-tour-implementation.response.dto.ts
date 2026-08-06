import { Prisma } from 'src/prisma/generated/client';
import type { StorageService } from 'src/storage/storage.service';
import {
  embeddedUserQueryArgs,
  toEmbeddedUserResponse,
  type EmbeddedUserResponse,
} from 'src/user/dtos/user.response.dto';

export const userAssignedTourImplementationQueryArgs = {
  select: {
    id: true,
    userId: true,
    role: true,
    tourImplementationAssignmentId: true,
    customUserName: true,
    customPhone: true,
    currentOption: true,
    permissions: true,
    user: embeddedUserQueryArgs,
    tourImplementationAssignment: true,
  },
} satisfies Prisma.UserAssignedTourImplementationDefaultArgs;

type UserAssignedTourImplementationPayload = Prisma.UserAssignedTourImplementationGetPayload<
  typeof userAssignedTourImplementationQueryArgs
>;
export type UserAssignedTourImplementationResponse = Omit<
  UserAssignedTourImplementationPayload,
  'user'
> & {
  user: EmbeddedUserResponse | null;
};

export const toUserAssignedTourImplementationResponse = (
  userAssignedTourImplementation: UserAssignedTourImplementationPayload,
  storageService: StorageService,
): UserAssignedTourImplementationResponse => {
  const { user, ...userAssignedTourImplementationRest } = userAssignedTourImplementation;
  return {
    ...userAssignedTourImplementationRest,
    user: user && toEmbeddedUserResponse(user, storageService),
  };
};
