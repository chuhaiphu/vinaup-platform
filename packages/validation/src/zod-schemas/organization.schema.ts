import { z } from 'zod';

import { ORGANIZATION_MEMBER_TYPE } from '../constants/organization.constant';
import { VN_PHONE_REGEX } from '../constants/phone.constant';

export const createOrganizationSchema = z.strictObject({
  name: z.string().trim().min(1),
  email: z.email().nullish(),
  phone: z.string().trim().min(1),
  address: z.string().trim().min(1).nullish(),
  website: z.string().trim().min(1).nullish(),
  province: z.string().trim().min(1),
  organizationIndustryId: z.string().trim().min(1),
});

export const updateOrganizationSchema = createOrganizationSchema.partial().extend({
  description: z.string().trim().min(1).nullish(), // update-only field; nullable column → .nullish()
});

export const createOrganizationCustomerSchema = z.strictObject({
  organizationId: z.string().trim().min(1), // existence is checked in the service, not here
  name: z.string().trim().min(1),
  phone: z.string().trim().regex(VN_PHONE_REGEX),
  email: z.email().nullish(),
  status: z.string().trim().min(1),
  joinedAt: z.iso.datetime(),
  clientUserId: z.string().trim().min(1).nullish(),
  clientOrganizationId: z.string().trim().min(1).nullish(), // existence is checked in the service, not here
});

export const updateOrganizationCustomerSchema = createOrganizationCustomerSchema.partial();

export const createOrganizationMemberSchema = z.strictObject({
  organizationId: z.string().trim().min(1), // existence is checked in the service, not here
  name: z.string().trim().min(1),
  type: z.enum(ORGANIZATION_MEMBER_TYPE),
  phone: z.string().trim().regex(VN_PHONE_REGEX),
  address: z.string().trim().min(1).nullish(),
  email: z.email().nullish(),
  status: z.string().trim().min(1),
  joinedAt: z.iso.datetime(),
  organizationRoleId: z.string().trim().min(1), // existence is checked in the service, not here
  userId: z.string().trim().min(1).nullish(), // existence is checked in the service, not here
});

export const updateOrganizationMemberSchema = createOrganizationMemberSchema.partial();
