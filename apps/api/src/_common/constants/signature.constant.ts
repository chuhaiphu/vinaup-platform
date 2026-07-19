export const DOCUMENT_TYPE = {
  PROJECT: 'PROJECT',
  INVOICE: 'INVOICE',
  BOOKING: 'BOOKING',
  TOUR_CALCULATION: 'TOUR_CALCULATION',
  TOUR_SETTLEMENT: 'TOUR_SETTLEMENT',
} as const;
export type DocumentType = (typeof DOCUMENT_TYPE)[keyof typeof DOCUMENT_TYPE];

export const SIGNATURE_ROLE = {
  SENDER: 'SENDER',
  RECEIVER: 'RECEIVER',
} as const;
export type SignatureRole = (typeof SIGNATURE_ROLE)[keyof typeof SIGNATURE_ROLE];