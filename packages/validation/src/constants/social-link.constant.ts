export const SOCIAL_LINK_PLATFORM = {
  ZALO: 'ZALO',
  FACEBOOK: 'FACEBOOK',
  WHATSAPP: 'WHATSAPP',
} as const;
export type SocialLinkPlatform = (typeof SOCIAL_LINK_PLATFORM)[keyof typeof SOCIAL_LINK_PLATFORM];
