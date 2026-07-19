import type { z } from 'zod';

import {
  createOrganizationCustomerSchema,
  createOrganizationMemberSchema,
  createOrganizationSchema,
  updateOrganizationCustomerSchema,
  updateOrganizationMemberSchema,
  updateOrganizationSchema,
} from '../zod-schemas/organization.schema';

export type CreateOrganizationRequestInterface = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationRequestInterface = z.infer<typeof updateOrganizationSchema>;
export type CreateOrganizationCustomerRequestInterface = z.infer<typeof createOrganizationCustomerSchema>;
export type UpdateOrganizationCustomerRequestInterface = z.infer<typeof updateOrganizationCustomerSchema>;
export type CreateOrganizationMemberRequestInterface = z.infer<typeof createOrganizationMemberSchema>;
export type UpdateOrganizationMemberRequestInterface = z.infer<typeof updateOrganizationMemberSchema>;
