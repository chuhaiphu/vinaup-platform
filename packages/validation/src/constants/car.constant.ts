// ─── Technical status: user-set, STORED in Car.status ────────────────────────
// The source of truth a user directly edits. LOCKED blocks trip assignment.
export const CAR_STATUS = {
  READY: 'READY',
  NEEDS_CHECK: 'NEEDS_CHECK',
  LOCKED: 'LOCKED',
} as const;

export type CarStatus = (typeof CAR_STATUS)[keyof typeof CAR_STATUS];
