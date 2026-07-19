import { TourStatus } from '@/constants/tour-constants';

import { OrganizationCustomerResponse } from './organization-customer-interfaces';
import { OrganizationResponse } from './organization-interfaces';
import { TourCalculationResponse } from './tour-calculation-interfaces';
import { TourImplementationResponse } from './tour-implementation-interfaces';
import { TourSettlementResponse } from './tour-settlement-interfaces';
import { UserResponse } from './user-interfaces';

export type {
  CreateTourRequestInterface as CreateTourRequest,
  UpdateTourRequestInterface as UpdateTourRequest,
} from '@vinaup-platform/validation';

export interface TourResponse {
  id: string;
  code: string | null;
  description: string;
  startDate: string;
  endDate: string;
  status: TourStatus;
  note: string | null;
  createdAt: string;
  createdByUserId: string | null;
  createdBy: UserResponse | null;
  organizationId: string;
  organization: OrganizationResponse | null;
  organizationCustomerId: string | null;
  organizationCustomer: OrganizationCustomerResponse | null;
  externalOrganizationName: string | null;
  externalCustomerName: string | null;
  tourCalculation: TourCalculationResponse | null;
  tourImplementation: TourImplementationResponse | null;
  tourSettlement: TourSettlementResponse | null;
}

export interface TourCancelLogtourCancelLogSnapshot {
  id?: string;
  code?: string | null;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  note?: string | null;
  organizationId?: string;
  organizationCustomerId?: string | null;
  externalOrganizationName?: string | null;
  externalCustomerName?: string | null;
}
