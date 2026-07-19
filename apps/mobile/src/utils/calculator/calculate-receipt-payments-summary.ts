import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';

import { calculateVatAmount } from './calculate-vat-amount';

export function calculateReceiptPaymentsSummary(
  receiptPayments?: ReceiptPaymentResponse[] | null,
): {
  bankIn: number;
  bankOut: number;
  cashIn: number;
  cashOut: number;
  totalReceipt: number;
  totalPayment: number;
  totalRemaining: number;
  totalVAT: number;
} {
  if (!receiptPayments || receiptPayments?.length === 0) {
    return {
      bankIn: 0,
      bankOut: 0,
      cashIn: 0,
      cashOut: 0,
      totalReceipt: 0,
      totalPayment: 0,
      totalRemaining: 0,
      totalVAT: 0,
    };
  }

  return receiptPayments.reduce(
    (acc, item) => {
      const total = item.unitPrice * item.quantity * item.frequency;
      const vatDeduction = calculateVatAmount(total, item.vatRate);

      if (item.transactionType === 'BANK') {
        if (item.type === 'RECEIPT') acc.bankIn += total;
        else acc.bankOut += total;
      } else if (item.transactionType === 'CASH') {
        if (item.type === 'RECEIPT') acc.cashIn += total;
        else acc.cashOut += total;
      }

      if (item.type === 'PAYMENT') acc.totalPayment += total;
      else if (item.type === 'RECEIPT') acc.totalReceipt += total;

      acc.totalVAT += vatDeduction;
      acc.totalRemaining = acc.totalReceipt - acc.totalPayment;
      return acc;
    },
    {
      bankIn: 0,
      bankOut: 0,
      cashIn: 0,
      cashOut: 0,
      totalReceipt: 0,
      totalPayment: 0,
      totalRemaining: 0,
      totalVAT: 0,
    },
  );
}
