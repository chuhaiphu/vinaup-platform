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

export const socialLinkQueryArgs = {
  include: {
    user: embeddedUserQueryArgs,
    organization: embeddedOrganizationQueryArgs,
    createdBy: embeddedUserQueryArgs,
  },
} satisfies Prisma.SocialLinkDefaultArgs;

type SocialLinkPayload = Prisma.SocialLinkGetPayload<typeof socialLinkQueryArgs>;
export type SocialLinkResponse = Omit<
  SocialLinkPayload,
  'user' | 'organization' | 'createdBy'
> & {
  user: EmbeddedUserResponse | null;
  organization: EmbeddedOrganizationResponse | null;
  createdBy: EmbeddedUserResponse | null;
};

export const toSocialLinkResponse = (
  socialLink: SocialLinkPayload,
  storageService: StorageService,
): SocialLinkResponse => {
  const { user, organization, createdBy, ...socialLinkRest } = socialLink;
  return {
    ...socialLinkRest,
    user: user && toEmbeddedUserResponse(user, storageService),
    organization: organization && toEmbeddedOrganizationResponse(organization, storageService),
    createdBy: createdBy && toEmbeddedUserResponse(createdBy, storageService),
  };
};
