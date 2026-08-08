export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  DISABLED: 'DISABLED',
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

// Seeded into every new account so it is usable before the user configures anything.
export const DEFAULT_PROJECT_CATEGORIES = ['Tiền công', 'Dự án'];

export const SYSTEM_RECEIPT_PAYMENT_CATEGORIES = [
  'Hoa hồng',
  'Tạm ứng',
  'Đặt cọc',
  'Hoàn ứng',
  'Trả góp',
  'Mượn nợ',
  'Trả nợ',
];
