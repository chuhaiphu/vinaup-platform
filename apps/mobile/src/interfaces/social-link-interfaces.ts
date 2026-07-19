import { SocialLinkPlatform } from '@/constants/social-link-constants';

import { OrganizationResponse } from './organization-interfaces';
import { UserResponse } from './user-interfaces';

export type {
  CreateSocialLinkRequestInterface as CreateSocialLinkRequest,
  UpdateSocialLinkRequestInterface as UpdateSocialLinkRequest,
} from '@vinaup-platform/validation';

export interface SocialLinkResponse {
  id: string;
  description: string | null;
  platform: SocialLinkPlatform;
  url: string;
  user: UserResponse | null;
  organization: OrganizationResponse | null;
  createdBy: UserResponse | null;
}
