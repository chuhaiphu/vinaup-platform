export const PERMISSION_ACTION = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  // Special: matches ANY action (maps to CASL's reserved `manage` keyword in the engine).
  MANAGE: 'MANAGE',
} as const;

export type PermissionAction = (typeof PERMISSION_ACTION)[keyof typeof PERMISSION_ACTION];

export const PERMISSION_RESOURCE = {
  // Special: matches ANY resource (maps to CASL's reserved `all` keyword in the engine).
  ALL: 'ALL',

  // Organization directory
  ORGANIZATION_MEMBER: 'ORGANIZATION_MEMBER',
  ORGANIZATION_CUSTOMER: 'ORGANIZATION_CUSTOMER',
  ORGANIZATION_ROLE: 'ORGANIZATION_ROLE',

  // Finance
  PROJECT: 'PROJECT',
  PROJECT_CATEGORY: 'PROJECT_CATEGORY',
  INVOICE: 'INVOICE',
  RECEIPT_PAYMENT: 'RECEIPT_PAYMENT',
  RECEIPT_PAYMENT_CATEGORY: 'RECEIPT_PAYMENT_CATEGORY',

  // Tour — one resource per persisted entity (each carries its own organizationId).
  TOUR: 'TOUR',
  TOUR_CALCULATION: 'TOUR_CALCULATION',
  TOUR_IMPLEMENTATION: 'TOUR_IMPLEMENTATION',
  TOUR_SETTLEMENT: 'TOUR_SETTLEMENT',

  // Operations
  BOOKING: 'BOOKING',
  TRIP: 'TRIP',
  CAR: 'CAR',
  SOCIAL_LINK: 'SOCIAL_LINK',

  // Attendance
  ATTENDANCE_RECORD: 'ATTENDANCE_RECORD',
  ATTENDANCE_CONCLUSION: 'ATTENDANCE_CONCLUSION',
} as const;

export type PermissionResource = (typeof PERMISSION_RESOURCE)[keyof typeof PERMISSION_RESOURCE];
