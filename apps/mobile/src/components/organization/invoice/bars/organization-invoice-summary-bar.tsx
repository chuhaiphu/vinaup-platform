import { ReceiptPaymentsSummaryBar } from '@/components/commons/bars/receipt-payments-summary-bar';
import { InvoiceResponse } from '@/interfaces/invoice-interfaces';
import { useReceiptPaymentListInInvoiceContext } from '@/providers/commons/receipt-payment/receipt-payment-list-in-invoice-provider';
import { useInvoiceDetailContext } from '@/providers/organization/invoice/invoice-detail-provider';
import { useOrganizationInvoiceListContext } from '@/providers/organization/invoice/organization-invoice-list-provider';

export interface OrganizationInvoiceSummaryBarProps {
  invoice?: InvoiceResponse;
  invoices?: InvoiceResponse[];
}

export function OrganizationInvoiceSummaryBar(props: OrganizationInvoiceSummaryBarProps) {
  if (props.invoice) {
    return <SingleInvoiceSummary invoice={props.invoice} />;
  }
  return <MultiInvoicesSummary />;
}

function SingleInvoiceSummary({ invoice }: { invoice: InvoiceResponse }) {
  const { handleUpdateInvoice, isUpdatingInvoice } = useInvoiceDetailContext();
  const { receiptPayments } = useReceiptPaymentListInInvoiceContext();
  return (
    <ReceiptPaymentsSummaryBar
      receiptPayments={receiptPayments}
      invoiceType={invoice.type}
      entityDiscountAmount={invoice.discountAmount}
      entityVatRate={invoice.vatRate}
      isIncludedTotalReceipt={false}
      isIncludedTotalPayment={false}
      onUpdateEntityVatRate={(value) =>
        handleUpdateInvoice({ vatRate: Number.parseFloat(value) || 0 })
      }
      isUpdatingEntityVatRate={isUpdatingInvoice}
      onUpdateEntityDiscountValue={(value) =>
        handleUpdateInvoice({ discountAmount: Number.parseFloat(value) || 0 })
      }
      isUpdatingEntityDiscountValue={isUpdatingInvoice}
    />
  );
}

function MultiInvoicesSummary() {
  const { allReceiptPayments } = useOrganizationInvoiceListContext();
  return (
    <ReceiptPaymentsSummaryBar
      receiptPayments={allReceiptPayments}
      isIncludedTotalReceipt={false}
      isIncludedTotalPayment={false}
    />
  );
}
