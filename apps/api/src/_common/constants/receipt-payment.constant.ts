export const RECEIPT_PAYMENT_TYPE = {
  RECEIPT: 'RECEIPT',
  PAYMENT: 'PAYMENT',
} as const;
export type ReceiptPaymentType = (typeof RECEIPT_PAYMENT_TYPE)[keyof typeof RECEIPT_PAYMENT_TYPE];

export const RECEIPT_PAYMENT_TRANSACTION_TYPE = {
  CASH: 'CASH',
  BANK: 'BANK',
} as const;
export type ReceiptPaymentTransactionType = (typeof RECEIPT_PAYMENT_TRANSACTION_TYPE)[keyof typeof RECEIPT_PAYMENT_TRANSACTION_TYPE];

export const RECEIPT_PAYMENT_DEPOSIT_TYPE = {
  CASH: 'CASH',
  BANK: 'BANK',
} as const;
export type ReceiptPaymentDepositType = (typeof RECEIPT_PAYMENT_DEPOSIT_TYPE)[keyof typeof RECEIPT_PAYMENT_DEPOSIT_TYPE];