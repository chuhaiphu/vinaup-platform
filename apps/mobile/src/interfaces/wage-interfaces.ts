import { WageStatus } from '@/constants/wage-constants';

import { UserResponse } from './user-interfaces';

export type {
  CreateWageRequestInterface as CreateWageRequest,
  UpdateWageRequestInterface as UpdateWageRequest,
} from '@vinaup-platform/validation';

export interface WageResponse {
  id: string;
  code: string | null;
  description: string;
  startDate: string;
  endDate: string;
  status: WageStatus;
  note: string | null;
  externalOrganizationName: string | null;
  externalCustomerName: string | null;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string | null;
  createdBy: UserResponse | null;
}
