// @vinaup-platform/validation — public surface.
import { z } from 'zod';

z.config(z.locales.vi());

export {
  ATTENDANCE_CONCLUSION_STATUS,
  ATTENDANCE_MODE,
  ATTENDANCE_RECORD_STATUS,
} from './constants/attendance.constant';
export type {
  AttendanceConclusionStatus,
  AttendanceMode,
  AttendanceRecordStatus,
} from './constants/attendance.constant';
export { BOOKING_STATUS } from './constants/booking.constant';
export type { BookingStatus } from './constants/booking.constant';
export { CAR_STATUS } from './constants/car.constant';
export type { CarStatus } from './constants/car.constant';
export { INVOICE_STATUS, INVOICE_TYPE } from './constants/invoice.constant';
export type { InvoiceStatus, InvoiceType } from './constants/invoice.constant';
export { ORGANIZATION_MEMBER_TYPE } from './constants/organization.constant';
export type { OrganizationMemberType } from './constants/organization.constant';
export { VN_PHONE_REGEX } from './constants/phone.constant';
export { PROJECT_STATUS } from './constants/project.constant';
export type { ProjectStatus } from './constants/project.constant';
export {
  RECEIPT_PAYMENT_DEPOSIT_TYPE,
  RECEIPT_PAYMENT_TRANSACTION_TYPE,
  RECEIPT_PAYMENT_TYPE,
} from './constants/receipt-payment.constant';
export type {
  ReceiptPaymentDepositType,
  ReceiptPaymentTransactionType,
  ReceiptPaymentType,
} from './constants/receipt-payment.constant';
export { DOCUMENT_TYPE } from './constants/signature.constant';
export type { DocumentType } from './constants/signature.constant';
export { SOCIAL_LINK_PLATFORM } from './constants/social-link.constant';
export { TRIP_STATUS } from './constants/trip.constant';
export type { TripStatus } from './constants/trip.constant';
export type { SocialLinkPlatform } from './constants/social-link.constant';
export { TOUR_IMPLEMENTATION_ADVANCE_TYPE, TOUR_STATUS } from './constants/tour.constant';
export type { TourImplementationAdvanceType, TourStatus } from './constants/tour.constant';
export { WAGE_STATUS } from './constants/wage.constant';
export type { WageStatus } from './constants/wage.constant';

export {
  attendanceRecordFilterSchema,
  checkOutAttendanceRecordSchema,
  createAttendanceConclusionSchema,
  createAttendanceRecordSchema,
  updateAttendanceConclusionSchema,
  updateAttendanceRecordSchema,
} from './zod-schemas/attendance.schema';
export { localSignInSchema, updateAuthSecretSchema } from './zod-schemas/auth.schema';
export {
  bookingFilterSchema,
  createBookingSchema,
  updateBookingSchema,
} from './zod-schemas/booking.schema';
export {
  carFilterSchema,
  createCarAssignmentSchema,
  createCarSchema,
  updateCarSchema,
} from './zod-schemas/car.schema';
export { updateFuelPriceSchema } from './zod-schemas/fuel-price.schema';
export {
  createInvoiceSchema,
  invoiceFilterSchema,
  updateInvoiceSchema,
} from './zod-schemas/invoice.schema';
export {
  createOrganizationCustomerSchema,
  createOrganizationMemberSchema,
  createOrganizationSchema,
  updateOrganizationCustomerSchema,
  updateOrganizationMemberSchema,
  updateOrganizationSchema,
} from './zod-schemas/organization.schema';
export {
  createReceiptPaymentCategorySchema,
  createReceiptPaymentSchema,
  findReceiptPaymentsByInvoiceIdsSchema,
  findReceiptPaymentsByProjectIdsSchema,
  findReceiptPaymentsByWageIdsSchema,
  receiptPaymentFilterSchema,
  updateReceiptPaymentCategorySchema,
  updateReceiptPaymentSchema,
} from './zod-schemas/receipt-payment.schema';
export { manageReceiverSignaturesSchema, updateSignatureUrlSchema } from './zod-schemas/signature.schema';
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
export {
  createTourSchema,
  createUserAssignedSchema,
  manageMembersAssignedSchema,
  tourFilterSchema,
  updateTourCalculationSchema,
  updateTourImplementationAssignmentSchema,
  updateTourImplementationSchema,
  updateTourSchema,
  updateTourSettlementSchema,
  updateUserAssignedSchema,
} from './zod-schemas/tour.schema';
export { createUserSchema, updateUserSchema, userFilterSchema } from './zod-schemas/user.schema';
export { createWageSchema, updateWageSchema, wageFilterSchema } from './zod-schemas/wage.schema';
export { dateInstanceFilterFields } from './zod-schemas/_shared/date-filter.schema';
export type {
  AttendanceRecordFilterRequestInterface,
  CheckOutAttendanceRecordRequestInterface,
  CreateAttendanceConclusionRequestInterface,
  CreateAttendanceRecordRequestInterface,
  UpdateAttendanceConclusionRequestInterface,
  UpdateAttendanceRecordRequestInterface,
} from './interfaces/attendance.interface';
export type {
  LocalSignInRequestInterface,
  UpdateAuthSecretRequestInterface,
} from './interfaces/auth.interface';
export type {
  BookingFilterRequestInterface,
  CreateBookingRequestInterface,
  UpdateBookingRequestInterface,
} from './interfaces/booking.interface';
export type {
  CarFilterRequestInterface,
  CreateCarAssignmentRequestInterface,
  CreateCarRequestInterface,
  UpdateCarRequestInterface,
} from './interfaces/car.interface';
export type { UpdateFuelPriceRequestInterface } from './interfaces/fuel-price.interface';
export type {
  CreateInvoiceRequestInterface,
  InvoiceFilterRequestInterface,
  UpdateInvoiceRequestInterface,
} from './interfaces/invoice.interface';
export type {
  CreateOrganizationCustomerRequestInterface,
  CreateOrganizationMemberRequestInterface,
  CreateOrganizationRequestInterface,
  UpdateOrganizationCustomerRequestInterface,
  UpdateOrganizationMemberRequestInterface,
  UpdateOrganizationRequestInterface,
} from './interfaces/organization.interface';
export type {
  CreateReceiptPaymentCategoryRequestInterface,
  CreateReceiptPaymentRequestInterface,
  FindReceiptPaymentsByInvoiceIdsRequestInterface,
  FindReceiptPaymentsByProjectIdsRequestInterface,
  FindReceiptPaymentsByWageIdsRequestInterface,
  ReceiptPaymentFilterRequestInterface,
  UpdateReceiptPaymentCategoryRequestInterface,
  UpdateReceiptPaymentRequestInterface,
} from './interfaces/receipt-payment.interface';
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
  CreateTourRequestInterface,
  CreateUserAssignedRequestInterface,
  ManageMembersAssignedRequestInterface,
  TourFilterRequestInterface,
  UpdateTourCalculationRequestInterface,
  UpdateTourImplementationAssignmentRequestInterface,
  UpdateTourImplementationRequestInterface,
  UpdateTourRequestInterface,
  UpdateTourSettlementRequestInterface,
  UpdateUserAssignedRequestInterface,
} from './interfaces/tour.interface';
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
