import { ReceiptPaymentsSummaryBar } from '@/components/commons/bars/receipt-payments-summary-bar';
import { ProjectResponse } from '@/interfaces/project-interfaces';
import { useReceiptPaymentListInProjectContext } from '@/providers/commons/receipt-payment/receipt-payment-list-in-project-provider';
import { usePersonalProjectListContext } from '@/providers/personal/project/personal-project-list-provider';

export interface PersonalProjectSummaryBarProps {
  projectId?: string;
  projects?: ProjectResponse[];
}

export function PersonalProjectSummaryBar(props: PersonalProjectSummaryBarProps) {
  if (props.projectId) {
    return <SingleProjectSummary />;
  }
  return <MultiProjectsSummary />;
}

function SingleProjectSummary() {
  const { receiptPayments } = useReceiptPaymentListInProjectContext();
  return <ReceiptPaymentsSummaryBar receiptPayments={receiptPayments} isIncludedSubTotal={false} />;
}

function MultiProjectsSummary() {
  const { receiptPayments } = usePersonalProjectListContext();
  return <ReceiptPaymentsSummaryBar receiptPayments={receiptPayments} isIncludedSubTotal={false} />;
}
