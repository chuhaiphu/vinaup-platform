import { ReceiptPaymentsSummaryBar } from '@/components/commons/bars/receipt-payments-summary-bar';
import { ProjectResponse } from '@/interfaces/project-interfaces';
import { useReceiptPaymentListInProjectContext } from '@/providers/commons/receipt-payment/receipt-payment-list-in-project-provider';
import { useOrganizationProjectListContext } from '@/providers/organization/project/organization-project-list-provider';

export interface OrganizationProjectSummaryBarProps {
  projectId?: string;
  projects?: ProjectResponse[];
}

export function OrganizationProjectSummaryBar(props: OrganizationProjectSummaryBarProps) {
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
  const { allReceiptPayments } = useOrganizationProjectListContext();
  return (
    <ReceiptPaymentsSummaryBar receiptPayments={allReceiptPayments} isIncludedSubTotal={false} />
  );
}
