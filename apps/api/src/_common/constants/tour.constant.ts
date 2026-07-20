// The model a guarded tour route's id points to — TourImplementationAccessGuard walks from it to the owning
// tour implementation. Full model names so a route reads unambiguously (mirrors PERMISSION_RESOURCE).
export const TOUR_TARGET_RESOURCE = {
  TOUR: 'TOUR',
  TOUR_IMPLEMENTATION: 'TOUR_IMPLEMENTATION',
  TOUR_IMPLEMENTATION_ASSIGNMENT: 'TOUR_IMPLEMENTATION_ASSIGNMENT',
  USER_ASSIGNED_TOUR_IMPLEMENTATION: 'USER_ASSIGNED_TOUR_IMPLEMENTATION',
} as const;
export type TourTargetResource = (typeof TOUR_TARGET_RESOURCE)[keyof typeof TOUR_TARGET_RESOURCE];

// The minimum relationship strength a route demands on a tour implementation — MANAGER ⊂ ASSIGNEE.
export const TOUR_IMPLEMENTATION_ACCESS_LEVEL = {
  MANAGER: 'MANAGER', // the org owner, or an assigned organization member (creator/director) — crew management
  ASSIGNEE: 'ASSIGNEE', // a MANAGER, or any assigned user (tour guide/driver, need not be an org member)
} as const;
export type TourImplementationAccessLevel = (typeof TOUR_IMPLEMENTATION_ACCESS_LEVEL)[keyof typeof TOUR_IMPLEMENTATION_ACCESS_LEVEL];
