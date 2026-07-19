// ─── Technical status: user-set, STORED in Car.status ────────────────────────
// The source of truth a user directly edits. LOCKED blocks trip assignment.
export const CAR_STATUS = {
  READY: 'READY',
  NEEDS_CHECK: 'NEEDS_CHECK',
  LOCKED: 'LOCKED',
} as const;

export type CarStatus = (typeof CAR_STATUS)[keyof typeof CAR_STATUS];

// ─── Operational status: DERIVED, never stored ───────────────────────────────
export const CAR_OPERATIONAL_STATUS = {
  OPERATING: 'OPERATING',
  RESTING: 'RESTING',
} as const;

export type CarOperationalStatus = (typeof CAR_OPERATIONAL_STATUS)[keyof typeof CAR_OPERATIONAL_STATUS];

export const CAR_ASSIGNMENT_EVENT_ACTION = {
  ASSIGNED: 'ASSIGNED',
  UNASSIGNED: 'UNASSIGNED',
} as const;

export type CarAssignmentEventAction =
  (typeof CAR_ASSIGNMENT_EVENT_ACTION)[keyof typeof CAR_ASSIGNMENT_EVENT_ACTION];
