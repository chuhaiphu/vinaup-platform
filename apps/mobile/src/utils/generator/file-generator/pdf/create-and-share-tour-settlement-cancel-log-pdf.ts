import { OrganizationResponse } from '@/interfaces/organization-interfaces';
import { SignatureResponse } from '@/interfaces/signature-interfaces';
import { TourSettlementCancelLogResponse } from '@/interfaces/tour-settlement-interfaces';
import { generateBase64FromUrl } from '@/utils/generator/string-generator/generate-base64-from-url';

import { createAndSharePdf } from './create-and-share-pdf';
import {
  generateTourCancelLogHtml,
  type GroupedReceiptPayment,
  type PdfPageSize,
  type TourCancelLogSnapshot,
  type TicketSummarySnapshot,
} from '../html/generate-tour-cancel-log-html';

interface TourSettlementCancelLogPdfInput {
  cancelLog: TourSettlementCancelLogResponse;
  organization?: OrganizationResponse;
  tourCancelLogSnapshot: TourCancelLogSnapshot;
  ticketSummary: TicketSummarySnapshot;
  groupedReceiptPayments: GroupedReceiptPayment[];
  senderSignature?: SignatureResponse;
  receiverSignatures: SignatureResponse[];
  customerName: string;
  totalExpectedCount: number;
  pageSize?: PdfPageSize;
}

export async function createAndShareTourSettlementCancelLogPdf(
  input: TourSettlementCancelLogPdfInput,
): Promise<void> {
  const avatarBase64 = await generateBase64FromUrl(input.organization?.avatarUrl);
  const html = generateTourCancelLogHtml(
    {
      canceledAt: input.cancelLog.createdAt,
      canceledByUserName: input.cancelLog.canceledByUser?.name ?? null,
      organization: input.organization,
      tourCancelLogSnapshot: input.tourCancelLogSnapshot,
      ticketSummary: input.ticketSummary,
      groupedReceiptPayments: input.groupedReceiptPayments,
      senderSignature: input.senderSignature,
      receiverSignatures: input.receiverSignatures,
      customerName: input.customerName,
      totalExpectedCount: input.totalExpectedCount,
      pageSize: input.pageSize,
      mainTitle: 'Quyết toán',
      summaryHeaderLabel: 'Thực tế',
    },
    avatarBase64,
  );
  await createAndSharePdf(html);
}
