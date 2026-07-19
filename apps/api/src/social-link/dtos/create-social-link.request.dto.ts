import { IsIn, IsOptional } from 'class-validator';

import { SOCIAL_LINK_PLATFORM, type SocialLinkPlatform } from 'src/_common/constants/social-link.constant';
import { IsStringNotBlank, TrimToUndefined } from 'src/_core/decorators/validation.decorator';

export class CreateSocialLinkRequest {
  @IsIn(Object.values(SOCIAL_LINK_PLATFORM))
  platform!: SocialLinkPlatform;

  @IsStringNotBlank()
  url!: string;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  description?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  userId?: string | null;

  @TrimToUndefined()
  @IsOptional()
  @IsStringNotBlank()
  organizationId?: string | null;
}
