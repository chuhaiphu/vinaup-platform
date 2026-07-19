import { WageStatus } from '@/constants/wage-constants';

import { UserResponse } from './user-interfaces';

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

export interface CreateWageRequest {
  code?: string | null;
  description: string;
  endDate: string;
  startDate: string;
  note?: string | null;
  externalOrganizationName?: string | null;
  externalCustomerName?: string | null;
}

export type UpdateWageRequest = Partial<CreateWageRequest> & {
  status?: WageStatus;
};
