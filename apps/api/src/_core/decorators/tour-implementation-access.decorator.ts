import { SetMetadata } from '@nestjs/common';

import type {
  TourImplementationAccessLevel,
  TourTargetResource,
} from 'src/_common/constants/tour.constant';

export const TOUR_IMPLEMENTATION_ACCESS_KEY = 'tourImplementationAccess';

// How a route declares the tour access it requires — what TourImplementationAccessGuard reads back.
export interface TourImplementationAccessMetadata {
  // Where the id is carried on the request, and under which key.
  source: 'param' | 'body';
  idKey: string;
  // Which model the id points to — the guard walks from it to the owning tour implementation.
  targetResource: TourTargetResource;
  // The relationship strength this route requires (default MANAGER — crew management).
  // This is the bar the route demands, not the caller's level; the engine derives what the caller
  // holds from the DB and checks it clears this bar.
  requiredAccessLevel?: TourImplementationAccessLevel;
}

// ─── Stamp the route with how to reach its tour implementation + the access it demands
// Nothing runs at request time here — TourImplementationAccessGuard reads the metadata back.
export const CheckTourImplementationAccess = (metadata: TourImplementationAccessMetadata) =>
  SetMetadata(TOUR_IMPLEMENTATION_ACCESS_KEY, metadata);
