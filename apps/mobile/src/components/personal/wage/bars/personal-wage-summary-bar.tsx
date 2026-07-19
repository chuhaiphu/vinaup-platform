import { ReceiptPaymentsSummaryBar } from '@/components/commons/bars/receipt-payments-summary-bar';
import { WageResponse } from '@/interfaces/wage-interfaces';
import { useReceiptPaymentListInWageContext } from '@/providers/commons/receipt-payment/receipt-payment-list-in-wage-provider';
import { usePersonalWageListContext } from '@/providers/personal/wage/personal-wage-list-provider';

export interface PersonalWageSummaryBarProps {
  wageId?: string;
  wages?: WageResponse[];
}

export function PersonalWageSummaryBar(props: PersonalWageSummaryBarProps) {
  if (props.wageId) {
    return <SingleWageSummary />;
  }
  return <MultiWagesSummary />;
}

function SingleWageSummary() {
  const { receiptPayments } = useReceiptPaymentListInWageContext();
  return <ReceiptPaymentsSummaryBar receiptPayments={receiptPayments} isIncludedSubTotal={false} />;
}

function MultiWagesSummary() {
  const { receiptPayments } = usePersonalWageListContext();
  return <ReceiptPaymentsSummaryBar receiptPayments={receiptPayments} isIncludedSubTotal={false} />;
}
