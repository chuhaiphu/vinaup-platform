import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';

import { calculateVatAmount } from './calculate-vat-amount';

/**
 * Mirrors calculateTourTicketSummaries, adapted for a trip:
 * - `rentalPrice` plays the role of the tour's ticket revenue (a single lump revenue).
 * - `commissionRate` adds a driver-rental fee (% of rentalPrice) to the total expense.
 */
export function calculateTripCostSummaries(
  receiptPayments: ReceiptPaymentResponse[],
  trip: {
    rentalPrice: number;
    taxRate: number;
    commissionRate: number;
  } | null,
) {
  const rentalPrice = trip?.rentalPrice || 0;
  const taxRate = trip?.taxRate || 0;
  const commissionRate = trip?.commissionRate || 0;

  // ─── Step 1: Driver-rental fee ─────
  // Why round: whole-đồng via the app-wide Math.round money rule, so the displayed fee
  // reconciles exactly when it is added into Tổng chi (matches trip-expense-summary).
  const driverRentalFee = Math.round((rentalPrice * commissionRate) / 100);

  // ─── Step 2: Fold the receipt-payment rows ─────
  // Why a single reduce: revenue, expense and deductible VAT all derive from the same
  // rows, so one pass avoids re-iterating (mirrors the tour calculator).
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

  // ─── Step 3: Totals ─────
  // Tổng thu = receipt-payment receipts + rentalPrice.
  // Tổng chi = receipt-payment payments + driver-rental fee (the trip-specific addition).
  const totalReceipt = receiptPaymentsSummary.totalReceiptFromReceiptPayments + rentalPrice;
  const totalPayment = receiptPaymentsSummary.totalPayment + driverRentalFee;

  // ─── Step 4: VAT ─────
  // GTGT is levied on rentalPrice (the trip's own revenue), matching the tour where it is
  // levied on ticket revenue only — receipt-payment receipts are excluded on purpose.
  const vatGTGT = calculateVatAmount(rentalPrice, taxRate);
  const vatDeducted = receiptPaymentsSummary.totalTaxDeducted;
  const totalTaxPay = Math.max(0, vatGTGT - vatDeducted);

  // ─── Step 5: Profit & margin ─────
  const netProfitBeforeTaxPay = totalReceipt - totalPayment;
  const netProfitAfterTaxPay = netProfitBeforeTaxPay - totalTaxPay;

  const profitMarginBeforeTaxPay =
    totalReceipt > 0 ? (netProfitBeforeTaxPay / totalReceipt) * 100 : 0;

  const profitMarginAfterTaxPay =
    totalReceipt > 0 ? (netProfitAfterTaxPay / totalReceipt) * 100 : 0;

  return {
    driverRentalFee,
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
