import { OrganizationResponse } from '@/interfaces/organization-interfaces';
import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';
import { SignatureResponse } from '@/interfaces/signature-interfaces';
import { generateFormatDateTime } from '@/utils/generator/string-generator/generate-format-date-time';
import { generateLocaleFormatString } from '@/utils/generator/string-generator/generate-locale-format-string';

export type PdfPageSize = 'A4' | 'A5';

export interface TourCancelLogSnapshot {
  tour?: {
    description?: string;
    startDate?: string | Date;
    endDate?: string | Date;
    code?: string | null;
    note?: string | null;
  };
  adultTicketCount?: number;
  childTicketCount?: number;
  adultTicketPrice?: number;
  childTicketPrice?: number;
  taxRate?: number;
}

export interface GroupedReceiptPayment {
  label: string;
  items: ReceiptPaymentResponse[];
}

export interface TicketSummarySnapshot {
  totalReceipt: number;
  totalPayment: number;
  totalTaxPay: number;
  netProfitAfterTaxPay: number;
  profitMarginAfterTaxPay: number;
}

export interface TourCancelLogPdfHtmlInput {
  canceledAt: string;
  canceledByUserName: string | null;
  organization?: OrganizationResponse;
  tourCancelLogSnapshot: TourCancelLogSnapshot;
  ticketSummary: TicketSummarySnapshot;
  groupedReceiptPayments: GroupedReceiptPayment[];
  senderSignature?: SignatureResponse;
  receiverSignatures: SignatureResponse[];
  customerName: string;
  totalExpectedCount: number;
  pageSize?: PdfPageSize;
  mainTitle: string;
  summaryHeaderLabel: string;
}

/**
 * Sanitize dữ liệu người dùng trước khi nhúng vào HTML template.
 * Chuyển các ký tự đặc biệt HTML (&, <, >, ", ') thành HTML entities tương ứng,
 * ngăn chặn dữ liệu bị trình duyệt hiểu nhầm thành HTML tag và làm vỡ layout PDF.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function buildReceiptPaymentRows(items: ReceiptPaymentResponse[]): string {
  return items
    .map((item) => {
      const total = item.unitPrice * item.quantity * item.frequency;
      return `
        <div class="detail-row">
          <div class="detail-col-1">${escapeHtml(item.description || '-')}</div>
          <div class="detail-col-2">${generateLocaleFormatString(item.unitPrice)}</div>
          <div class="detail-col-3">${item.quantity}</div>
          <div class="detail-col-4">${item.frequency}</div>
          <div class="detail-col-5">${generateLocaleFormatString(total)}</div>
        </div>
      `;
    })
    .join('');
}

export function generateTourCancelLogHtml(
  input: TourCancelLogPdfHtmlInput,
  avatarBase64?: string,
): string {
  const {
    canceledAt,
    canceledByUserName,
    organization,
    tourCancelLogSnapshot,
    ticketSummary,
    groupedReceiptPayments,
    senderSignature,
    receiverSignatures,
    customerName,
    totalExpectedCount,
    pageSize = 'A4',
    mainTitle,
    summaryHeaderLabel,
  } = input;

  const avatarBlock = avatarBase64
    ? `<img class="avatar" src="${avatarBase64}" alt="avatar" />`
    : '<div class="avatar-fallback">👥</div>';

  const receiptGroupsBlock =
    groupedReceiptPayments.length > 0
      ? groupedReceiptPayments
          .map(
            (group) => `
          <div class="section-block">
            <div class="date-group-title">${escapeHtml(group.label)}</div>
            <div class="thin-divider"></div>
            <div class="detail-header-row">
              <div class="detail-col-1">Tên nội dung</div>
              <div class="detail-col-2">Đơn giá</div>
              <div class="detail-col-3">SLượng</div>
              <div class="detail-col-4">SLần</div>
              <div class="detail-col-5">Thành tiền</div>
            </div>
            <div class="thin-divider"></div>
            ${buildReceiptPaymentRows(group.items)}
          </div>
          <div class="thin-divider"></div>
        `,
          )
          .join('')
      : '<div class="empty-text">Chưa có dữ liệu thu chi.</div>';

  const senderBlock = senderSignature
    ? `
      <div class="sig-block">
        <div class="sig-row-space">
          <div class="sig-role-wrap">↗ <span class="sig-role-italic">Tạo:</span></div>
          <div class="sig-date-text-italic">${escapeHtml(generateFormatDateTime(senderSignature.signedAt || null))}</div>
        </div>
        <div class="sig-row-space">
          <div class="sig-name">${escapeHtml(senderSignature.targetUser?.name || senderSignature.targetName || '-')}</div>
          <div class="sig-status">${senderSignature.isSigned ? '(Đã ký)' : '(Chưa ký)'}</div>
        </div>
      </div>
    `
    : '';

  const receiverBlocks = receiverSignatures
    .map(
      (receiver) => `
      <div class="sig-block">
        <div class="sig-row-space">
          <div class="sig-role-wrap">✓ <span class="sig-role-italic">Nhận:</span></div>
          <div class="sig-date-text-italic">${escapeHtml(generateFormatDateTime(receiver.signedAt || null))}</div>
        </div>
        <div class="sig-row-space">
          <div class="sig-name">${escapeHtml(receiver.targetUser?.name || receiver.targetName || '-')}</div>
          <div class="sig-status">${receiver.isSigned ? '(Đã ký)' : '(Chưa ký)'}</div>
        </div>
      </div>
    `,
    )
    .join('');

  const signatureFallback =
    !senderSignature && receiverSignatures.length === 0
      ? '<div class="empty-text">Không có dữ liệu ký tên.</div>'
      : '';

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          @page {
            size: ${pageSize};
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #2a2a2a;
            margin: 0;
            line-height: 1.35;
            font-size: 14px;
          }

          .header-title-row,
          .sub-header-row,
          .tour-sub-info-row,
          .table-header-row,
          .table-row,
          .detail-header-row,
          .detail-row,
          .notes-section,
          .parties-section,
          .sig-row-space,
          .fin-row {
            display: flex;
            align-items: center;
          }

          .header-title-row,
          .sub-header-row,
          .tour-sub-info-row,
          .table-header-row,
          .table-row,
          .sig-row-space,
          .parties-section {
            justify-content: space-between;
          }

          .header-title-row {
            margin-bottom: 4px;
          }

          .main-title {
            font-size: 24px;
            font-weight: 700;
            color: #005c62;
          }

          .avatar {
            width: 36px;
            height: 36px;
            border-radius: 18px;
            object-fit: cover;
            border: 1px solid #d8d8d8;
          }

          .avatar-fallback {
            width: 36px;
            height: 36px;
            border-radius: 18px;
            border: 1px solid #d8d8d8;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #005c62;
            font-size: 18px;
          }

          .org-name {
            font-size: 16px;
            color: #2a2a2a;
            flex: 1;
            margin-right: 8px;
          }

          .date-text,
          .tour-time,
          .tour-no,
          .sig-date-text-italic,
          .cancel-text,
          .party-label,
          .fin-label {
            font-size: 14px;
            color: #686868;
          }

          .tour-time,
          .tour-no,
          .sig-date-text-italic {
            font-style: italic;
          }

          .thick-divider {
            height: 4px;
            background: #005c62;
            margin: 8px 0;
          }

          .medium-divider {
            height: 2px;
            background: #005c62;
            margin: 8px 0;
          }

          .thin-divider {
            height: 1px;
            background: #d8d8d8;
            margin: 8px 0;
          }

          .section-block {
            padding: 4px 0;
          }

          .tour-name,
          .details-title,
          .signature-title,
          .date-group-title {
            font-size: 15px;
            color: #2a2a2a;
            font-weight: 700;
          }

          .tour-name {
            margin-bottom: 4px;
          }

          .tour-time {
            flex: 1;
          }

          .tour-no {
            margin-left: 8px;
          }

          .table-header-row {
            margin-bottom: 8px;
          }

          .summary-col-1,
          .summary-col-2,
          .summary-col-3,
          .detail-col-1,
          .detail-col-2,
          .detail-col-3,
          .detail-col-4,
          .detail-col-5,
          .fin-label,
          .fin-value,
          .fin-value-bold {
            font-size: 14px;
            color: #2a2a2a;
          }

          .summary-col-1,
          .detail-col-1 {
            flex: 2;
            text-align: left;
          }

          .summary-col-2 {
            flex: 1;
            text-align: right;
          }

          .summary-col-3 {
            flex: 1.5;
            text-align: right;
          }

          .table-row {
            margin-bottom: 6px;
          }

          .summary-header {
            font-weight: 500;
          }

          .financial-section {
            padding: 4px 0;
          }

          .fin-row {
            margin-bottom: 4px;
          }

          .fin-label {
            flex: 3;
            text-align: right;
          }

          .fin-value,
          .fin-value-bold {
            flex: 1.5;
            text-align: right;
          }

          .fin-value-bold {
            font-weight: 700;
          }

          .details-title {
            margin-top: 4px;
          }

          .empty-text {
            font-size: 14px;
            color: #a2a2a2;
            margin-bottom: 8px;
          }

          .detail-header-row,
          .detail-row {
            padding: 4px 0;
          }

          .detail-header-row {
            font-weight: 500;
          }

          .detail-col-2,
          .detail-col-3,
          .detail-col-4 {
            flex: 1.1;
            text-align: center;
          }

          .detail-col-5 {
            flex: 1.5;
            text-align: right;
          }

          .notes-section {
            padding: 4px 0;
            gap: 8px;
          }

          .note-text {
            font-size: 14px;
            color: #a2a2a2;
            flex: 1;
          }

          .parties-section {
            padding: 4px 0;
            margin-bottom: 8px;
          }

          .party-col,
          .party-col-right {
            flex: 1;
          }

          .party-col-right {
            text-align: right;
          }

          .party-label {
            text-decoration: underline;
            margin-bottom: 4px;
          }

          .party-value,
          .sig-name,
          .sig-status {
            font-size: 15px;
            color: #2a2a2a;
          }

          .party-value-teal {
            font-size: 15px;
            color: #005c62;
          }

          .signature-section {
            padding: 4px 0;
          }

          .sig-block {
            margin-bottom: 12px;
          }

          .sig-row-space {
            gap: 8px;
          }

          .sig-role-wrap {
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .sig-role-italic {
            font-size: 14px;
            font-style: italic;
            color: #2a2a2a;
          }

          .cancel-text,
          .sig-name {
            flex: 1;
          }

          .footer {
            margin-top: 8px;
          }

          .double-line {
            height: 3px;
            border-top: 1px solid #2a2a2a;
            border-bottom: 1px solid #2a2a2a;
            margin-bottom: 8px;
          }

          .footer-text {
            text-align: center;
            font-size: 13px;
            color: #686868;
          }

          .page-break-avoid {
            page-break-inside: avoid;
          }

          .section-block,
          .sig-block,
          .financial-section,
          .notes-section,
          .parties-section,
          .signature-section {
            page-break-inside: avoid;
          }

          .content-wrap {
            width: 100%;
            max-width: 100%;
          }
        </style>
      </head>
      <body>
        <div class="content-wrap">
          <div class="header-title-row">
            <div class="main-title">${escapeHtml(mainTitle)}</div>
            ${avatarBlock}
          </div>

          <div class="sub-header-row">
            <div class="org-name">${escapeHtml(organization?.name || '-')}</div>
            <div class="date-text">${escapeHtml(generateFormatDateTime(canceledAt))}</div>
          </div>

          <div class="thick-divider"></div>

          <div class="section-block">
            <div class="tour-name">Tên: ${escapeHtml(tourCancelLogSnapshot.tour?.description || '-')}</div>
            <div class="tour-sub-info-row">
              <div class="tour-time">Từ ${escapeHtml(generateFormatDateTime(tourCancelLogSnapshot.tour?.startDate ?? null))} đến ${escapeHtml(generateFormatDateTime(tourCancelLogSnapshot.tour?.endDate ?? null))}</div>
              <div class="tour-no">No.${escapeHtml(tourCancelLogSnapshot.tour?.code || '-')}</div>
            </div>
          </div>

          <div class="thin-divider"></div>

          <div class="section-block page-break-avoid">
            <div class="table-header-row">
              <div class="summary-col-1 summary-header">Tổng (${escapeHtml(summaryHeaderLabel)}) = ${totalExpectedCount}</div>
              <div class="summary-col-2 summary-header">S.lượng</div>
              <div class="summary-col-3 summary-header">Giá bán</div>
            </div>
            <div class="table-row">
              <div class="summary-col-1">Khách lớn</div>
              <div class="summary-col-2">${tourCancelLogSnapshot.adultTicketCount ?? 0}</div>
              <div class="summary-col-3">${generateLocaleFormatString(Number(tourCancelLogSnapshot.adultTicketPrice))}</div>
            </div>
            <div class="table-row">
              <div class="summary-col-1">Trẻ em</div>
              <div class="summary-col-2">${tourCancelLogSnapshot.childTicketCount ?? 0}</div>
              <div class="summary-col-3">${generateLocaleFormatString(Number(tourCancelLogSnapshot.childTicketPrice))}</div>
            </div>
          </div>

          <div class="thin-divider"></div>

          <div class="financial-section page-break-avoid">
            <div class="fin-row">
              <div class="fin-label">Tổng thu</div>
              <div class="fin-value">${generateLocaleFormatString(ticketSummary.totalReceipt)}</div>
            </div>
            <div class="fin-row">
              <div class="fin-label">Tổng chi</div>
              <div class="fin-value-bold">${generateLocaleFormatString(ticketSummary.totalPayment)}</div>
            </div>
            <div class="fin-row">
              <div class="fin-label">Thuế phải nộp ${tourCancelLogSnapshot.taxRate ?? 0} %</div>
              <div class="fin-value">${generateLocaleFormatString(ticketSummary.totalTaxPay)}</div>
            </div>
            <div class="fin-row">
              <div class="fin-label">Lợi nhuận sau thuế</div>
              <div class="fin-value">${generateLocaleFormatString(ticketSummary.netProfitAfterTaxPay)}</div>
            </div>
            <div class="fin-row">
              <div class="fin-label">Tỷ suất lợi nhuận</div>
              <div class="fin-value">${generateLocaleFormatString(ticketSummary.profitMarginAfterTaxPay)}%</div>
            </div>
          </div>

          <div class="details-title">Chi tiết thu chi</div>
          <div class="medium-divider"></div>
          ${receiptGroupsBlock}

          <div class="notes-section page-break-avoid">
            <div>💬</div>
            <div class="note-text">${escapeHtml(tourCancelLogSnapshot.tour?.note || '-')}</div>
          </div>

          <div class="thin-divider"></div>

          <div class="parties-section page-break-avoid">
            <div class="party-col">
              <div class="party-label">Bên bán</div>
              <div class="party-value">${escapeHtml(organization?.name || '-')}</div>
            </div>
            <div class="party-col-right">
              <div class="party-label">Tên đoàn</div>
              <div class="party-value-teal">${escapeHtml(customerName || '-')}</div>
            </div>
          </div>

          <div class="signature-section page-break-avoid">
            <div class="signature-title">Ký tên</div>
            <div class="medium-divider"></div>

            <div class="sig-row-space">
              <div class="cancel-text">Hủy bởi: ${escapeHtml(canceledByUserName || '-')}</div>
              <div class="sig-date-text-italic">${escapeHtml(generateFormatDateTime(canceledAt))}</div>
            </div>

            <div class="thin-divider"></div>
            ${senderBlock}
            ${receiverBlocks}
            ${signatureFallback}
          </div>

          <div class="footer">
            <div class="double-line"></div>
            <div class="footer-text">VinaUp.com (Ứng dụng thu chi & quản lý)</div>
          </div>
        </div>
      </body>
    </html>
  `;
}
