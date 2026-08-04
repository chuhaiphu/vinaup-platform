import { COLORS, FONT_SIZES } from './style-constants';

export const DD_MM_DATE_FORMAT_SHORT = 'DD/MM';
export const HH_MM_DATE_FORMAT_SHORT = 'HH:mm';
export const YYYY_DATE_FORMAT = 'YYYY';
export const MM_YYYY_DATE_FORMAT = 'MM/YYYY';
export const DD_MM_YYYY_DATE_FORMAT = 'DD/MM/YYYY';
export const YYYY_MM_DD_DATE_FORMAT = 'YYYY-MM-DD';
export const DD_MM_YYYY_HH_MM_DATE_FORMAT = 'DD/MM/YYYY HH:mm';

// ─── Why SecureStore, not AsyncStorage ──────────────────────────────────────
// SecureStore keeps tokens in the iOS Keychain / Android Keystore (encrypted)
// so a device backup or filesystem read cannot exfiltrate them.
export const ACCESS_TOKEN_KEY = 'access-token';
export const REFRESH_TOKEN_KEY = 'refresh-token';

// Proactive refresh fires this many ms BEFORE the token's real expiry.
export const EXPIRY_SKEW_MS = 30_000;

// Keys are UPPER_SNAKE (constant convention); values stay kebab-case — they are the
// on-device AsyncStorage slot names, so changing them would orphan persisted data.
export const STORAGE_KEYS = {
  CURRENT_USER: 'current-user',
  PERSONAL_UTILITIES: 'personal-utilities',
  ORGANIZATION_UTILITIES: 'organization-utilities',
};

/**
 * Personal utilities
 */
export const PERSONAL_UTILITY_KEYS = {
  PROJECT: 'project',
  WAGE: 'wage',
  CALENDAR: 'calendar',
} as const;
export type PersonalUtilityKey = (typeof PERSONAL_UTILITY_KEYS)[keyof typeof PERSONAL_UTILITY_KEYS];

/**
 * Organization utilities
 */
export const ORGANIZATION_UTILITY_KEYS = {
  INVOICE_SELL: 'invoice-sell',
  INVOICE_BUY: 'invoice-buy',
  BOOKING: 'booking',
} as const;

export type OrganizationUtilityKey =
  (typeof ORGANIZATION_UTILITY_KEYS)[keyof typeof ORGANIZATION_UTILITY_KEYS];

/**
 * Chrome shared by every native Stack header.
 */
export const STACK_SCREEN_OPTIONS = {
  headerStyle: { backgroundColor: COLORS.white },
  headerTintColor: COLORS.teal700,
  headerTitleStyle: { fontSize: FONT_SIZES.lg, color: COLORS.teal900 },
  // A no-op on iOS, the only way Android centres.
  headerTitleAlign: 'center',
  headerShadowVisible: false,
  // iOS: chevron only, matching the bar this replaced.
  headerBackButtonDisplayMode: 'minimal',
} as const;

export const SCREEN_TITLES = {
  PERSONAL_HOME: 'Trang chủ',
  PERSONAL_WAGE: 'Tiền công',
  PERSONAL_PROJECT: 'Dự án',
  PERSONAL_CALENDAR: 'Lịch',
  PERSONAL_PROFILE: 'Cá nhân',
  ORGANIZATION_HOME: 'Trang chủ',
  ORGANIZATION_INVOICE: 'Hoá đơn',
  ORGANIZATION_PROJECT: 'Dự án',
  ORGANIZATION_TOUR: 'Tour',
  ORGANIZATION_BOOKING: 'Booking',
  ORGANIZATION_CAR: 'Xe',
  ORGANIZATION_ATTENDANCE: 'Chấm công',
  ORGANIZATION_PROFILE: 'Tổ chức',
} as const;
