import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';

import { calculateVatAmount } from './calculate-vat-amount';

export function calculateTourTicketSummaries(
  receiptPayments: ReceiptPaymentResponse[],
  tourTicket: {
    adultTicketCount: number;
    childTicketCount: number;
    adultTicketPrice: number;
    childTicketPrice: number;
    taxRate: number;
  } | null,
) {
  const adultTicketCount = tourTicket?.adultTicketCount || 0;
  const childTicketCount = tourTicket?.childTicketCount || 0;
  const adultTicketPrice = tourTicket?.adultTicketPrice || 0;
  const childTicketPrice = tourTicket?.childTicketPrice || 0;

  const ticketRevenue = adultTicketCount * adultTicketPrice + childTicketCount * childTicketPrice;

  const initialReceiptPaymentsSummary = {
    totalReceiptFromReceiptPayments: 0,
    totalPayment: 0,
    totalTaxDeducted: 0,
  };

  const receiptPaymentsSummary = (receiptPayments || []).reduce((acc, item) => {
    const total = item.unitPrice * item.quantity;

    if (item.type === 'RECEIPT') {
      acc.totalReceiptFromReceiptPayments += total;
    } else if (item.type === 'PAYMENT') {
      acc.totalPayment += total;
      if (item.vatRate) {
        acc.totalTaxDeducted += calculateVatAmount(total, item.vatRate);
      }
    }

    return acc;
  }, initialReceiptPaymentsSummary);

  const totalReceipt = receiptPaymentsSummary.totalReceiptFromReceiptPayments + ticketRevenue;

  const totalPayment = receiptPaymentsSummary.totalPayment;

  const vatGTGT = calculateVatAmount(ticketRevenue, tourTicket?.taxRate);
  const vatDeducted = receiptPaymentsSummary.totalTaxDeducted;
  const totalTaxPay = Math.max(0, vatGTGT - vatDeducted);

  const netProfitBeforeTaxPay = totalReceipt - totalPayment;
  const netProfitAfterTaxPay = netProfitBeforeTaxPay - totalTaxPay;

  const profitMarginBeforeTaxPay =
    totalReceipt > 0 ? (netProfitBeforeTaxPay / totalReceipt) * 100 : 0;

  const profitMarginAfterTaxPay =
    totalReceipt > 0 ? (netProfitAfterTaxPay / totalReceipt) * 100 : 0;

  return {
    totalReceipt,
    totalPayment,
    vatGTGT,
    vatDeducted,
    totalTaxPay,
    netProfitBeforeTaxPay,
    netProfitAfterTaxPay,
    profitMarginBeforeTaxPay,
    profitMarginAfterTaxPay,
  };
}
