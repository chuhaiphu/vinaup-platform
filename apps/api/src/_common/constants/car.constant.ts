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
