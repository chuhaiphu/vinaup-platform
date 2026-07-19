// @vinaup-platform/validation — public surface. Exports added per domain as the Zod migration lands.
import { z } from 'zod';

z.config(z.locales.vi());

export { BOOKING_STATUS } from './constants/booking.constant';
export type { BookingStatus } from './constants/booking.constant';
export { INVOICE_STATUS } from './constants/invoice.constant';
export type { InvoiceStatus } from './constants/invoice.constant';
export { VN_PHONE_REGEX } from './constants/phone.constant';
export { PROJECT_STATUS } from './constants/project.constant';
export type { ProjectStatus } from './constants/project.constant';
export { DOCUMENT_TYPE } from './constants/signature.constant';
export type { DocumentType } from './constants/signature.constant';
export { SOCIAL_LINK_PLATFORM } from './constants/social-link.constant';
export { TRIP_STATUS } from './constants/trip.constant';
export type { TripStatus } from './constants/trip.constant';
export type { SocialLinkPlatform } from './constants/social-link.constant';
export { WAGE_STATUS } from './constants/wage.constant';
export type { WageStatus } from './constants/wage.constant';

export { localSignInSchema, updateAuthSecretSchema } from './zod-schemas/auth.schema';
export {
  bookingFilterSchema,
  createBookingSchema,
  updateBookingSchema,
} from './zod-schemas/booking.schema';
export { updateFuelPriceSchema } from './zod-schemas/fuel-price.schema';
export {
  createInvoiceSchema,
  invoiceFilterSchema,
  updateInvoiceSchema,
} from './zod-schemas/invoice.schema';
export {
  manageReceiverSignaturesSchema,
  updateSignatureUrlSchema,
} from './zod-schemas/signature.schema';
export {
  createProjectCategorySchema,
  createProjectSchema,
  projectFilterSchema,
  updateProjectCategorySchema,
  updateProjectSchema,
} from './zod-schemas/project.schema';
export { createSocialLinkSchema, updateSocialLinkSchema } from './zod-schemas/social-link.schema';
export {
  createTripAssignmentSchema,
  createTripSchema,
  tripFilterSchema,
  updateTripAssignmentSchema,
  updateTripSchema,
} from './zod-schemas/trip.schema';
export { createUserSchema, updateUserSchema, userFilterSchema } from './zod-schemas/user.schema';
export { createWageSchema, updateWageSchema, wageFilterSchema } from './zod-schemas/wage.schema';
export { assertDateRangeComplete, dateFilterFields } from './zod-schemas/_shared/date-filter.schema';
export type {
  LocalSignInRequestInterface,
  UpdateAuthSecretRequestInterface,
} from './interfaces/auth.interface';
export type {
  BookingFilterRequestInterface,
  CreateBookingRequestInterface,
  UpdateBookingRequestInterface,
} from './interfaces/booking.interface';
export type { UpdateFuelPriceRequestInterface } from './interfaces/fuel-price.interface';
export type {
  CreateInvoiceRequestInterface,
  InvoiceFilterRequestInterface,
  UpdateInvoiceRequestInterface,
} from './interfaces/invoice.interface';
export type {
  ManageReceiverSignaturesRequestInterface,
  UpdateSignatureUrlRequestInterface,
} from './interfaces/signature.interface';
export type {
  CreateProjectCategoryRequestInterface,
  CreateProjectRequestInterface,
  ProjectFilterRequestInterface,
  UpdateProjectCategoryRequestInterface,
  UpdateProjectRequestInterface,
} from './interfaces/project.interface';
export type {
  CreateSocialLinkRequestInterface,
  UpdateSocialLinkRequestInterface,
} from './interfaces/social-link.interface';
export type {
  CreateTripAssignmentRequestInterface,
  CreateTripRequestInterface,
  TripFilterRequestInterface,
  UpdateTripAssignmentRequestInterface,
  UpdateTripRequestInterface,
} from './interfaces/trip.interface';
export type {
  CreateUserRequestInterface,
  UpdateUserRequestInterface,
  UserFilterRequestInterface,
} from './interfaces/user.interface';
export type {
  CreateWageRequestInterface,
  UpdateWageRequestInterface,
  WageFilterRequestInterface,
} from './interfaces/wage.interface';
