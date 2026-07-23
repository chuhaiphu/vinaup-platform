// ─── Fetch tag registry — single source of truth ─────────────────────────────
//
// Three kinds of tag (see docs/CODING-CONVENTION.md §6):
//   A. Collection tag — constant string, no id: abstracts "every record of the entity".
//   B. Record tag     — `<entity>-${id}`: one specific record.
//   C. Child-list tag — `<resource>-list-in-<parent>-${parentId}`: a child list under a parent.

export const FETCH_TAG = {
  // ── A. Collection tags (static) ────────────────────────────────────────────
  carList: 'organization-car-list',
  tripList: 'organization-trip-list',
  tourList: 'organization-tour-list',
  projectList: 'organization-project-list',
  invoiceList: 'organization-invoice-list',
  bookingList: 'organization-booking-list',
  customerList: 'organization-customer-list',
  memberList: 'organization-member-list',
  tripAssignmentList: 'organization-trip-assignment-list',
  tourImplementationAssignmentList: 'tour-implementation-assignment-list',

  personalProjectList: 'personal-project-list',
  personalWageList: 'personal-wage-list',
  personalReceiptPaymentList: 'personal-receipt-payment-list',
  personalProjectCategoryList: 'personal-project-category-list',
  personalCalendarProject: 'personal-calendar-project',
  personalCalendarWage: 'personal-calendar-wage',

  fuelPrice: 'fuel-price',
  organizationList: 'organization-list',
  allOrganizationList: 'all-organization-list',
  tourCalculationCancelLogDetail: 'tour-calculation-cancel-log-detail',
  tourSettlementCancelLogDetail: 'tour-settlement-cancel-log-detail',

  // Collection tag for the receipt-payment child-list family (bare, paired with the dynamic type-C tag).
  receiptPaymentListInInvoiceCollection: 'organization-receipt-payment-list-in-invoice',
  receiptPaymentListInWageCollection: 'personal-receipt-payment-list-in-wage',
  receiptPaymentListInProjectCollection: 'receipt-payment-list-in-project', // cross-scope: no prefix

  // ── B. Record tags (dynamic, 1 id) ─────────────────────────────────────────
  carByCarId: (carId: string) => `organization-car-${carId}`,
  tripByTripId: (tripId: string) => `organization-trip-${tripId}`,
  tourByTourId: (tourId: string) => `organization-tour-${tourId}`,
  projectByProjectId: (projectId: string) => `organization-project-${projectId}`,
  invoiceByInvoiceId: (invoiceId: string) => `organization-invoice-${invoiceId}`,
  bookingByBookingId: (bookingId: string) => `organization-booking-${bookingId}`,
  tourImplementationByTourId: (tourId: string) => `tour-implementation-${tourId}`,
  tourCalculationByTourId: (tourId: string) => `tour-calculation-${tourId}`,
  tourSettlementByTourId: (tourId: string) => `tour-settlement-${tourId}`,
  personalProjectByProjectId: (projectId: string) => `personal-project-${projectId}`,
  personalWageByWageId: (wageId: string) => `personal-wage-${wageId}`,
  organizationAbilityByOrganizationId: (organizationId: string) =>
    `organization-ability-${organizationId}`,

  // ── C. Child-list tags (dynamic, parent id) ────────────────────────────────
  receiptPaymentListInTripByTripId: (tripId: string) =>
    `organization-receipt-payment-list-in-trip-${tripId}`,
  receiptPaymentListInBookingByBookingId: (bookingId: string) =>
    `organization-receipt-payment-list-in-booking-${bookingId}`,
  receiptPaymentListInTourCalculationByTourCalculationId: (tourCalculationId: string) =>
    `organization-receipt-payment-list-in-tour-calculation-${tourCalculationId}`,
  receiptPaymentListInTourSettlementByTourSettlementId: (tourSettlementId: string) =>
    `organization-receipt-payment-list-in-tour-settlement-${tourSettlementId}`,
  receiptPaymentListInInvoiceByInvoiceId: (invoiceId: string) =>
    `organization-receipt-payment-list-in-invoice-${invoiceId}`,
  receiptPaymentListInTourImplementationByTourImplementationId: (tourImplementationId: string) =>
    `organization-receipt-payment-list-in-tour-implementation-${tourImplementationId}`,
  receiptPaymentListInWageByWageId: (wageId: string) =>
    `personal-receipt-payment-list-in-wage-${wageId}`,
  receiptPaymentListInProjectByProjectId: (projectId: string) =>
    `receipt-payment-list-in-project-${projectId}`, // cross-scope: no prefix
  receiptPaymentListInCarMaintenanceLogByCarMaintenanceLogId: (carMaintenanceLogId: string) =>
    `organization-receipt-payment-list-in-car-maintenance-log-${carMaintenanceLogId}`,

  signatureListInTourCalculationByTourCalculationId: (tourCalculationId: string) =>
    `signature-list-in-tour-calculation-${tourCalculationId}`,
  signatureListInTourSettlementByTourSettlementId: (tourSettlementId: string) =>
    `signature-list-in-tour-settlement-${tourSettlementId}`,
  signatureListInBookingByBookingId: (bookingId: string) =>
    `signature-list-in-booking-${bookingId}`,

  tourCalculationCancelLogsByTourCalculationId: (tourCalculationId: string) =>
    `tour-calculation-cancel-logs-${tourCalculationId}`,
  tourSettlementCancelLogsByTourSettlementId: (tourSettlementId: string) =>
    `tour-settlement-cancel-logs-${tourSettlementId}`,

  bookingListInTourImplementationByTourImplementationId: (tourImplementationId: string) =>
    `organization-booking-list-in-tour-implementation-${tourImplementationId}`,
  carAssignmentHistoryByCarId: (carId: string) => `car-assignment-history-${carId}`,
  carExpiringByOrganizationId: (organizationId: string | null | undefined) =>
    `organization-car-expiring-${organizationId ?? 'none'}`,

  // receipt-payment-category list: one of two forms depending on whether organizationId is present.
  receiptPaymentCategoryListByOrganizationId: (organizationId?: string) =>
    organizationId
      ? `organization-receipt-payment-category-list-${organizationId}`
      : 'personal-receipt-payment-category-list',
} as const;

// ─── Write-ripple tags ────────────────────────────────────────────────────────
// RULE: a write to entity X must invalidate every fetch whose response embeds or derives from X — not only X's own tag.
//
// The signal is a `xxx: XxxResponse` field on a response — an embedded copy that goes stale on write.
//
//   interface BookResponse   { id; title; author: AuthorResponse }  // book list embeds author
//   interface AuthorResponse { id; name;  bookCount: number }       // author list embeds a count - derived from the book list
//
// Editing an author ⇒ its name is stale in the book list ⇒ the author writer emits the book-list tag.
// Creating/deleting a book ⇒ bookCount is stale ⇒ the book writer emits the author-list tag.
// The dependency runs both ways, so each side lists the other's tag.

// A car write restales: its own list; the assignment list (each assignment embeds a car
// copy); the trip list (its cards embed each assignment's car name via tripAssignments).
export const getCarRippleTags = (): string[] => [
  FETCH_TAG.carList,
  FETCH_TAG.tripAssignmentList,
  FETCH_TAG.tripList,
];
// A trip-assignment write restales: its own list; the car list (which derives each car's
// operationalStatus from assignments); the trip list (its cards embed the assignments'
// drivers + cars). Mirror of getCarRippleTags plus tripList.
export const getTripAssignmentRippleTags = (): string[] => [
  FETCH_TAG.tripAssignmentList,
  FETCH_TAG.carList,
  FETCH_TAG.tripList,
];

export const getTourRippleTags = (): string[] => [
  FETCH_TAG.tourList,
  FETCH_TAG.tourImplementationAssignmentList,
];
export const getTourImplementationAssignmentRippleTags = (): string[] => [
  FETCH_TAG.tourImplementationAssignmentList,
];

export const getTripRippleTags = (): string[] => [FETCH_TAG.tripList, FETCH_TAG.tripAssignmentList];

export const getBookingRippleTags = (tourImplementationId?: string | null): string[] => [
  FETCH_TAG.bookingList,
  ...(tourImplementationId
    ? [FETCH_TAG.bookingListInTourImplementationByTourImplementationId(tourImplementationId)]
    : []),
];

export const getPersonalProjectRippleTags = (): string[] => [
  FETCH_TAG.personalProjectList,
  FETCH_TAG.personalCalendarProject,
];
export const getPersonalWageRippleTags = (): string[] => [
  FETCH_TAG.personalWageList,
  FETCH_TAG.personalCalendarWage,
];
