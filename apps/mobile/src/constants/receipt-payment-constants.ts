import {
  RECEIPT_PAYMENT_GROUP_CODE,
  type ReceiptPaymentGroupCode,
} from '@vinaup-platform/permission';

// Wire enums referenced by shared Zod schemas live in the package (§1.3).
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

export { RECEIPT_PAYMENT_GROUP_CODE };
export type { ReceiptPaymentGroupCode };

export const ReceiptPaymentGroupCodeDisplay: Record<ReceiptPaymentGroupCode, string> = {
  [RECEIPT_PAYMENT_GROUP_CODE.FOR_DIRECTOR]: 'Điều hành',
  [RECEIPT_PAYMENT_GROUP_CODE.FOR_TOUR_GUIDE]: 'Bàn giao HDV',
};
