// Wire enums referenced by shared Zod schemas live in the package and are
// re-exported here so display maps and consumers keep their import path (§1.3).
export {
  RECEIPT_PAYMENT_DEPOSIT_TYPE,
  RECEIPT_PAYMENT_TRANSACTION_TYPE,
  RECEIPT_PAYMENT_TYPE,
} from '@vinaup-platform/validation';
export type {
  ReceiptPaymentDepositType,
  ReceiptPaymentTransactionType,
  ReceiptPaymentType,
} from '@vinaup-platform/validation';

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
