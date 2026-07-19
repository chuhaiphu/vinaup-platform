import {
  TourImplementationAssignment,
  User,
} from 'src/prisma/generated/client';

export interface UserAssignedTourImplementationResponse {
  id: string;
  userId: string | null;
  role: string;
  tourImplementationAssignmentId: string | null;
  tourImplementationAssignment: TourImplementationAssignment | null;
  user: User | null;
  customUserName: string | null;
  customPhone: string | null;
  currentOption: number;
  permissions: string[];
}
