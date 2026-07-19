export const RECEIPT_PAYMENT_TYPE = {
  RECEIPT: 'RECEIPT',
  PAYMENT: 'PAYMENT',
} as const;
export type ReceiptPaymentType = (typeof RECEIPT_PAYMENT_TYPE)[keyof typeof RECEIPT_PAYMENT_TYPE];

export const RECEIPT_PAYMENT_TRANSACTION_TYPE = {
  CASH: 'CASH',
  BANK: 'BANK',
} as const;
export type ReceiptPaymentTransactionType =
  (typeof RECEIPT_PAYMENT_TRANSACTION_TYPE)[keyof typeof RECEIPT_PAYMENT_TRANSACTION_TYPE];

export const RECEIPT_PAYMENT_DEPOSIT_TYPE = {
  CASH: 'CASH',
  BANK: 'BANK',
} as const;
export type ReceiptPaymentDepositType =
  (typeof RECEIPT_PAYMENT_DEPOSIT_TYPE)[keyof typeof RECEIPT_PAYMENT_DEPOSIT_TYPE];

export const RECEIPT_PAYMENT_GROUP_CODE = {
  FOR_DIRECTOR: 'FOR_DIRECTOR',
  FOR_TOUR_GUIDE: 'FOR_TOUR_GUIDE',
} as const;
export type ReceiptPaymentGroupCode =
  (typeof RECEIPT_PAYMENT_GROUP_CODE)[keyof typeof RECEIPT_PAYMENT_GROUP_CODE];

export const ReceiptPaymentGroupCodeDisplay: Record<ReceiptPaymentGroupCode, string> = {
  [RECEIPT_PAYMENT_GROUP_CODE.FOR_DIRECTOR]: 'Điều hành',
  [RECEIPT_PAYMENT_GROUP_CODE.FOR_TOUR_GUIDE]: 'Bàn giao HDV',
};
