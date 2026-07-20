// Vocabulary of the ReBAC (tour participation) plane — plain strings persisted in the DB.
//
// This file is VOCABULARY ONLY. The participation CHECK that reads these values
// (`assertTourParticipant`) lives in the API service layer, not here: it walks live Prisma rows
// (member/user assignments, the tour's organization owner) and cannot be packaged. See
// RBAC-ReBAC-PATTERN §7. Both api (enforce) and mobile (hide UI) import the same strings from here.

// Organization members assigned to run a tour implementation.
// CREATOR is the protecting role (a tour implementation always keeps one); DIRECTOR ("Điều hành")
// is an added crew member who may act inside the implementation.
export const TOUR_IMPLEMENTATION_MEMBER_ROLE = {
  CREATOR: 'CREATOR',
  DIRECTOR: 'DIRECTOR',
} as const;

export type TourImplementationMemberRole =
  (typeof TOUR_IMPLEMENTATION_MEMBER_ROLE)[keyof typeof TOUR_IMPLEMENTATION_MEMBER_ROLE];

// Non-member crew assigned to a tour implementation (an assigned user has no organization role).
export const TOUR_IMPLEMENTATION_USER_ROLE = {
  TOUR_GUIDE: 'TOUR_GUIDE',
  DRIVER: 'DRIVER',
} as const;

export type TourImplementationUserRole =
  (typeof TOUR_IMPLEMENTATION_USER_ROLE)[keyof typeof TOUR_IMPLEMENTATION_USER_ROLE];

// Which crew tier a receipt-payment category (and its payments) belongs to. Members see both tiers;
// an assigned user sees FOR_TOUR_GUIDE only when granted RECEIPT_PAYMENT_FOR_TOUR_GUIDE_READ below.
export const RECEIPT_PAYMENT_GROUP_CODE = {
  FOR_DIRECTOR: 'FOR_DIRECTOR',
  FOR_TOUR_GUIDE: 'FOR_TOUR_GUIDE',
} as const;

export type ReceiptPaymentGroupCode =
  (typeof RECEIPT_PAYMENT_GROUP_CODE)[keyof typeof RECEIPT_PAYMENT_GROUP_CODE];

// Per-assignment capabilities stored in an assigned user's `permissions[]`. This is the ReBAC-lite
// grant that widens what a single assigned user may read on their tour.
export const TOUR_ASSIGNMENT_PERMISSION = {
  RECEIPT_PAYMENT_FOR_TOUR_GUIDE_READ: 'RECEIPT_PAYMENT_FOR_TOUR_GUIDE_READ',
} as const;

export type TourAssignmentPermission =
  (typeof TOUR_ASSIGNMENT_PERMISSION)[keyof typeof TOUR_ASSIGNMENT_PERMISSION];
