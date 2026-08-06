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

export const projectQueryArgs = {
  include: {
    createdBy: embeddedUserQueryArgs,
    organization: embeddedOrganizationQueryArgs,
    organizationCustomer: true,
    category: true,
  },
} satisfies Prisma.ProjectDefaultArgs;

type ProjectPayload = Prisma.ProjectGetPayload<typeof projectQueryArgs>;
export type ProjectResponse = Omit<ProjectPayload, 'createdBy' | 'organization'> & {
  createdBy: EmbeddedUserResponse | null;
  organization: EmbeddedOrganizationResponse | null;
};

export const toProjectResponse = (
  project: ProjectPayload,
  storageService: StorageService,
): ProjectResponse => {
  const { createdBy, organization, ...projectRest } = project;
  return {
    ...projectRest,
    createdBy: createdBy && toEmbeddedUserResponse(createdBy, storageService),
    organization: organization && toEmbeddedOrganizationResponse(organization, storageService),
  };
};
