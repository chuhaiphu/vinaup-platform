import type { CarAssignmentEvent } from 'src/prisma/generated/client';

// Full-row response (no projection → no query-args const).
export type CarAssignmentEventResponse = CarAssignmentEvent;
