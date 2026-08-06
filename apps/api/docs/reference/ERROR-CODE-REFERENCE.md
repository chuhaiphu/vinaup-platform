# Error Code Reference

Single source of truth for every error the API can emit — custom exceptions with a stable machine `error` code, bare built-in exceptions, and validation failures. Use it for monitoring, alerting, client-side i18n, and QA.

For the *mechanism* (how throwing turns into a response, filters, ordering), see [Exception Filter Pattern](../pattern/EXCEPTION-FILTER-PATTERN.md). For *which exception to throw when*, see [Coding Convention §9](../CODING-CONVENTION.md#9-error-handling). This file is the *inventory*, not the pattern.

> Verified against `@nestjs/common@11.1.12` and `nestjs-zod@5.4.0`. Codes are extracted from `src/_common/exceptions/*` and their throw sites; keep this table in sync whenever an exception is added, renamed, or removed.

---

## Error Response envelopes

### A. Custom-code (preferred)

Every custom exception carries a **stable machine `error` code**.

```jsonc
{
  "error": "TOUR_NOT_FOUND",    // stable code — the key monitoring/i18n branch on
  "message": "Tour not found",   // human-readable reason (may change; do NOT key off it)
  "statusCode": 404              // mirrored inside the body, also the HTTP status line
}
```

### B. Validation envelope (`ZodValidationPipe`)

Request-body/param validation failures are shaped by `nestjs-zod`, **not** by our exceptions. Note the shape differs: **no `error` field**, and an extra `errors` array of Zod issues.

```jsonc
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [ /* Zod issue objects: path, code, message, … */ ]
}
```

### C. Built-in default

A built-in exception thrown without a custom code uses NestJS's default: `message` is a single string and `error` is the HTTP reason phrase.

```jsonc
{
  "statusCode": 422,
  "message": "Failed to fetch fuel prices from VNExpress API",
  "error": "Unprocessable Entity"
}
```

---

## 1. Custom exceptions — stable machine codes

The authoritative catalog. Each domain owns one file under [`src/_common/exceptions/`](../../src/_common/exceptions/), named `<domain>.exception.ts`, mirroring the `src/<domain>/` module it serves; a few cross-cutting concerns (document signing, system) have no owning module and get their own file. Every class overrides only the response body to `{ error, message, statusCode }`. Resource and business exceptions **extend the built-in that carries their status** — `NotFoundException` (404), `ForbiddenException` (403), `BadRequestException` (400), `ConflictException` (409) — so they stay in that status's catch bucket. The **auth** exceptions (`auth.exception.ts`) instead extend `HttpException` directly, never `UnauthorizedException`, so a 401 can't be pulled into the cookie-clearing filter by subclassing (see [Exception Filter Pattern](../pattern/EXCEPTION-FILTER-PATTERN.md)).

Codes are `SCREAMING_SNAKE_CASE`, shaped `<DOMAIN>_<REASON>`, unique across this reference. The `message` is written in **English** (developer-facing, for logs); the client never shows it — it localizes off the stable `error` code. A handful of throw sites today use a mismatched built-in status (e.g. a "not found" raised as `ForbiddenException`); the status below is the **normalized** one each code settles on.

### Auth — tokens & credentials - `auth.exception.ts`

The behavioral contract behind each code is in the [auth flows](../architecture/authen/).

| `error` code                 | HTTP | Exception class                    | Thrown by                                                                                                                                                                                    |
| ---------------------------- | ---- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ACCESS_TOKEN_INVALID`       | 401  | `AccessTokenInvalidException`      | [`jwt-auth.guard.ts`](../../src/_core/guards/jwt-auth.guard.ts) — the access JWT is expired, forged, or its user is gone. Clears `atk` and **keeps** the session so the client can refresh |
| `REFRESH_TOKEN_INVALID`      | 401  | `RefreshTokenInvalidException`     | [`auth.controller.ts`](../../src/auth/auth.controller.ts) (token missing), [`auth.service.ts`](../../src/auth/auth.service.ts) (no live `Session`) — clears **both** cookies |
| `AUTH_CREDENTIALS_INVALID`   | 401  | `InvalidCredentialsException`      | [`auth.service.ts`](../../src/auth/auth.service.ts) — unknown identifier, no `Auth(LOCAL)` row, or wrong password at sign-in; all four collapse to this one code. A plain 401 that does **not** clear cookies |
| `CURRENT_PASSWORD_INVALID`   | 401  | `CurrentPasswordInvalidException`  | [`auth.service.ts`](../../src/auth/auth.service.ts) — the step-up check on link-email |
| `ACCOUNT_DISABLED`           | 403  | `AccountDisabledException`         | [`auth.service.ts`](../../src/auth/auth.service.ts) — `user.status = DISABLED` at the sign-in user-status gate |
| `RESET_TOKEN_INVALID`        | 400  | `ResetTokenInvalidException`       | [`auth.service.ts`](../../src/auth/auth.service.ts) — the reset link token or reset code is missing, expired, consumed, or attempt-capped; one generic code for all, deliberately |
| `SIGN_UP_OTP_INVALID`        | 400  | `SignUpOtpInvalidException`        | [`auth.service.ts`](../../src/auth/auth.service.ts) — the sign-up code is missing, expired, consumed, attempt-capped, or wrong |
| `SIGN_IN_OTP_INVALID`        | 400  | `SignInOtpInvalidException`        | [`auth.service.ts`](../../src/auth/auth.service.ts) — the OTP sign-in code is missing, expired, consumed, attempt-capped, or wrong |
| `EMAIL_VERIFICATION_INVALID` | 400  | `EmailVerificationInvalidException`| [`auth.service.ts`](../../src/auth/auth.service.ts) — the link-email code is missing, expired, consumed, or attempt-capped |
| `PHONE_ALREADY_USED`         | 409  | `PhoneAlreadyUsedException`        | [`auth.service.ts`](../../src/auth/auth.service.ts) — sign-up with a phone already registered, and the `P2002` from a lost race |
| `EMAIL_ALREADY_USED`         | 409  | `EmailAlreadyUsedException`        | [`auth.service.ts`](../../src/auth/auth.service.ts) — the address belongs to another account, checked at both send and consume |
| `EMAIL_ALREADY_LINKED`       | 409  | `EmailAlreadyLinkedException`      | [`auth.service.ts`](../../src/auth/auth.service.ts) — the caller already has a linked email; changing it is a separate flow |

Only the two **token** codes route through the cookie-clearing `AuthExceptionFilter`, and they clear
different cookies ([Exception Filter Pattern](../pattern/EXCEPTION-FILTER-PATTERN.md)). Every other auth
code is a normal `HttpException` handled by the catch-all.

### User · `user.exception.ts`

| `error` code     | HTTP | Exception class         | Thrown by                                                                                                     |
| ---------------- | ---- | ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| `USER_NOT_FOUND` | 404  | `UserNotFoundException` | [`user.service.ts`](../../src/user/user.service.ts), [`signature.service.ts`](../../src/signature/signature.service.ts), [`organization-member.service.ts`](../../src/organization/services/organization-member.service.ts) |

### Organization · `organization.exception.ts`

The membership/permission family below is the shared vocabulary of the org RBAC plane — raised by `OrganizationPermissionGuard`, and by the receipt-payment service when it selects the org plane (Flow 3). One set of codes, so the client localizes an "access denied" identically everywhere.

| `error` code                       | HTTP | Exception class                          | Thrown by                                                                                     |
| ---------------------------------- | ---- | ---------------------------------------- | --------------------------------------------------------------------------------------------- |
| `ORGANIZATION_NOT_FOUND`           | 404  | `OrganizationNotFoundException`          | [`organization.service.ts`](../../src/organization/services/organization.service.ts), [`tour.service.ts`](../../src/tour/services/tour.service.ts), [`booking.service.ts`](../../src/booking/booking.service.ts), [`car.service.ts`](../../src/car/services/car.service.ts), [`trip.service.ts`](../../src/trip/services/trip.service.ts), [`organization-customer.service.ts`](../../src/organization/services/organization-customer.service.ts), [`organization-member.service.ts`](../../src/organization/services/organization-member.service.ts), [`receipt-payment.service.ts`](../../src/receipt-payment/services/receipt-payment.service.ts) |
| `ORGANIZATION_MEMBER_NOT_FOUND`    | 404  | `OrganizationMemberNotFoundException`    | [`organization-member.service.ts`](../../src/organization/services/organization-member.service.ts) |
| `ORGANIZATION_CUSTOMER_NOT_FOUND`  | 404  | `OrganizationCustomerNotFoundException`  | [`organization-customer.service.ts`](../../src/organization/services/organization-customer.service.ts) |
| `ORGANIZATION_ROLE_NOT_FOUND`      | 404  | `OrganizationRoleNotFoundException`      | [`organization-member.service.ts`](../../src/organization/services/organization-member.service.ts) — the `organizationRoleId` on create/update does not exist |
| `ORGANIZATION_NOT_MEMBER`          | 403  | `OrganizationNotMemberException`         | [`organization-permission.guard.ts`](../../src/_core/guards/organization-permission.guard.ts), [`receipt-payment.service.ts`](../../src/receipt-payment/services/receipt-payment.service.ts) — caller does not belong to the organization |
| `ORGANIZATION_MEMBER_LOCKED`       | 403  | `OrganizationMemberLockedException`      | [`organization-permission.guard.ts`](../../src/_core/guards/organization-permission.guard.ts), [`receipt-payment.service.ts`](../../src/receipt-payment/services/receipt-payment.service.ts) — caller is locked in the organization |
| `ORGANIZATION_PERMISSION_DENIED`   | 403  | `OrganizationPermissionDeniedException`  | [`organization-permission.guard.ts`](../../src/_core/guards/organization-permission.guard.ts), [`receipt-payment.service.ts`](../../src/receipt-payment/services/receipt-payment.service.ts) — caller lacks permission on the resource, or is not the creator of a personal record |
| `ORGANIZATION_MEMBER_ALREADY_LINKED`| 409 | `OrganizationMemberAlreadyLinkedException`| [`organization-member.service.ts`](../../src/organization/services/organization-member.service.ts) |
| `ORGANIZATION_MEMBER_DELETE_FORBIDDEN`| 403 | `OrganizationMemberDeleteForbiddenException`| [`organization-member.service.ts`](../../src/organization/services/organization-member.service.ts) — the member belongs to a different organization than the request |

### Car · `car.exception.ts`

| `error` code                     | HTTP | Exception class                       | Thrown by                                                                                    |
| -------------------------------- | ---- | ------------------------------------- | ------------------------------------------------------------------------------------------- |
| `CAR_NOT_FOUND`                  | 404  | `CarNotFoundException`                | [`car.service.ts`](../../src/car/services/car.service.ts), [`car-assignment.service.ts`](../../src/car/services/car-assignment.service.ts) |
| `CAR_MAINTENANCE_LOG_NOT_FOUND`  | 404  | `CarMaintenanceLogNotFoundException`  | [`car-maintenance-log.service.ts`](../../src/car/services/car-maintenance-log.service.ts)  , [`receipt-payment.service.ts`](../../src/receipt-payment/services/receipt-payment.service.ts) |
| `CAR_ASSIGNMENT_MEMBER_NOT_FOUND`| 404  | `CarAssignmentMemberNotFoundException`| [`car-assignment.service.ts`](../../src/car/services/car-assignment.service.ts) — a target member is not in the car's organization |
| `CAR_LOCKED`                     | 409  | `CarLockedException`                  | [`trip-assignment.service.ts`](../../src/trip/services/trip-assignment.service.ts) — the car's technical status is `LOCKED`, so it cannot be assigned |

### Trip · `trip.exception.ts`

| `error` code                          | HTTP | Exception class                          | Thrown by                                                                                     |
| ------------------------------------- | ---- | ---------------------------------------- | --------------------------------------------------------------------------------------------- |
| `TRIP_NOT_FOUND`                      | 404  | `TripNotFoundException`                  | [`trip.service.ts`](../../src/trip/services/trip.service.ts), [`trip-assignment.service.ts`](../../src/trip/services/trip-assignment.service.ts), [`receipt-payment.service.ts`](../../src/receipt-payment/services/receipt-payment.service.ts) |
| `TRIP_ASSIGNMENT_NOT_FOUND`           | 404  | `TripAssignmentNotFoundException`        | [`trip-assignment.service.ts`](../../src/trip/services/trip-assignment.service.ts) — update/delete a non-existent turn |
| `TRIP_ASSIGNMENT_CAR_NOT_FOUND`       | 404  | `TripAssignmentCarNotFoundException`     | [`trip-assignment.service.ts`](../../src/trip/services/trip-assignment.service.ts) — the car is not in the trip's organization |
| `TRIP_ASSIGNMENT_MEMBER_NOT_FOUND`    | 404  | `TripAssignmentMemberNotFoundException`  | [`trip-assignment.service.ts`](../../src/trip/services/trip-assignment.service.ts) — a member is not in the trip's organization |
| `TRIP_ASSIGNMENT_CAR_ALREADY_IN_TRIP` | 409  | `TripAssignmentCarAlreadyInTripException`| [`trip-assignment.service.ts`](../../src/trip/services/trip-assignment.service.ts) — the car already has a turn in this trip (`@@unique([tripId, carId])`) |

### Project · `project.exception.ts`

| `error` code                | HTTP | Exception class                  | Thrown by                                                                                                |
| --------------------------- | ---- | -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `PROJECT_NOT_FOUND`         | 404  | `ProjectNotFoundException`       | [`project.service.ts`](../../src/project/services/project.service.ts), [`signature.service.ts`](../../src/signature/signature.service.ts), [`receipt-payment.service.ts`](../../src/receipt-payment/services/receipt-payment.service.ts) |
| `PROJECT_CATEGORY_NOT_FOUND`| 404  | `ProjectCategoryNotFoundException`| [`project-category.service.ts`](../../src/project/services/project-category.service.ts)                  |

### Booking · `booking.exception.ts`

| `error` code                    | HTTP | Exception class                     | Thrown by                                                                                     |
| ------------------------------- | ---- | ----------------------------------- | --------------------------------------------------------------------------------------------- |
| `BOOKING_NOT_FOUND`             | 404  | `BookingNotFoundException`          | [`booking.service.ts`](../../src/booking/booking.service.ts), [`signature.service.ts`](../../src/signature/signature.service.ts), [`organization-permission.guard.ts`](../../src/_core/guards/organization-permission.guard.ts), [`receipt-payment.service.ts`](../../src/receipt-payment/services/receipt-payment.service.ts) |
| `BOOKING_COMPLETED_IMMUTABLE`   | 400  | `BookingCompletedImmutableException`| [`booking.service.ts`](../../src/booking/booking.service.ts) — cannot delete a completed booking |

### Invoice · `invoice.exception.ts`

| `error` code       | HTTP | Exception class            | Thrown by                                                                                     |
| ------------------ | ---- | -------------------------- | --------------------------------------------------------------------------------------------- |
| `INVOICE_NOT_FOUND`| 404  | `InvoiceNotFoundException` | [`invoice.service.ts`](../../src/invoice/invoice.service.ts), [`signature.service.ts`](../../src/signature/signature.service.ts), [`organization-permission.guard.ts`](../../src/_core/guards/organization-permission.guard.ts), [`receipt-payment.service.ts`](../../src/receipt-payment/services/receipt-payment.service.ts) |
| `INVOICE_TYPE_NOT_FOUND`| 404 | `InvoiceTypeNotFoundException` | [`invoice.service.ts`](../../src/invoice/invoice.service.ts) — the `invoiceTypeId` on create/update does not exist |

### Wage · `wage.exception.ts`

| `error` code    | HTTP | Exception class         | Thrown by                                       |
| --------------- | ---- | ----------------------- | ----------------------------------------------- |
| `WAGE_NOT_FOUND`| 404  | `WageNotFoundException` | [`wage.service.ts`](../../src/wage/wage.service.ts), [`receipt-payment.service.ts`](../../src/receipt-payment/services/receipt-payment.service.ts) |

### Receipt-Payment · `receipt-payment.exception.ts`

| `error` code                             | HTTP | Exception class                            | Thrown by                                                                                     |
| ---------------------------------------- | ---- | ------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `RECEIPT_PAYMENT_NOT_FOUND`              | 404  | `ReceiptPaymentNotFoundException`          | [`receipt-payment.service.ts`](../../src/receipt-payment/services/receipt-payment.service.ts) |
| `RECEIPT_PAYMENT_CATEGORY_NOT_FOUND`     | 404  | `ReceiptPaymentCategoryNotFoundException`  | [`receipt-payment-category.service.ts`](../../src/receipt-payment/services/receipt-payment-category.service.ts), [`organization-receipt-payment-category-mutation.guard.ts`](../../src/_core/guards/organization-receipt-payment-category-mutation.guard.ts) |
| `RECEIPT_PAYMENT_CATEGORY_SYSTEM_READONLY`| 403 | `ReceiptPaymentCategorySystemReadonlyException`| both files above — a system-owned category cannot be modified or deleted                 |
| `RECEIPT_PAYMENT_TOUR_IMPLEMENTATION_ACCESS_DENIED`     | 403  | `ReceiptPaymentTourImplementationAccessDeniedException`  | [`receipt-payment.service.ts`](../../src/receipt-payment/services/receipt-payment.service.ts) — caller is neither an assigned member of nor an assigned user to the tour implementation |

### Tour · `tour.exception.ts`

| `error` code                            | HTTP | Exception class                          | Thrown by                                                                                     |
| --------------------------------------- | ---- | ---------------------------------------- | --------------------------------------------------------------------------------------------- |
| `TOUR_NOT_FOUND`                        | 404  | `TourNotFoundException`                  | [`tour.service.ts`](../../src/tour/services/tour.service.ts), [`organization-permission.guard.ts`](../../src/_core/guards/organization-permission.guard.ts) — resolving a tour-scoped record |
| `TOUR_CALCULATION_NOT_FOUND`            | 404  | `TourCalculationNotFoundException`       | [`tour-calculation.service.ts`](../../src/tour/services/tour-calculation.service.ts), [`signature.service.ts`](../../src/signature/signature.service.ts), [`receipt-payment.service.ts`](../../src/receipt-payment/services/receipt-payment.service.ts) |
| `TOUR_CALCULATION_CANCEL_LOG_NOT_FOUND` | 404  | `TourCalculationCancelLogNotFoundException`| [`tour-calculation.service.ts`](../../src/tour/services/tour-calculation.service.ts)         |
| `TOUR_IMPLEMENTATION_NOT_FOUND`         | 404  | `TourImplementationNotFoundException`    | [`tour-implementation.service.ts`](../../src/tour/services/tour-implementation.service.ts), [`tour-implementation-assignment.service.ts`](../../src/tour/services/tour-implementation-assignment.service.ts), [`receipt-payment.service.ts`](../../src/receipt-payment/services/receipt-payment.service.ts), [`booking.service.ts`](../../src/booking/booking.service.ts) |
| `TOUR_IMPLEMENTATION_ACCESS_DENIED`                    | 403  | `TourImplementationAccessDeniedException`              | [`tour-implementation-access.service.ts`](../../src/tour/services/tour-implementation-access.service.ts) — via `TourImplementationAccessGuard` (crew routes) or the receipt-payment service (Flow 3); caller is neither assigned to the tour implementation nor its org owner |
| `TOUR_IMPLEMENTATION_CANNOT_REMOVE_SELF`| 403  | `TourImplementationCannotRemoveSelfException`| [`tour-implementation-assignment.service.ts`](../../src/tour/services/tour-implementation-assignment.service.ts) |
| `TOUR_IMPLEMENTATION_CANNOT_REMOVE_CREATOR`| 400 | `TourImplementationCannotRemoveCreatorException`| [`tour-implementation.service.ts`](../../src/tour/services/tour-implementation.service.ts) |
| `TOUR_IMPLEMENTATION_ASSIGNED_USER_NOT_FOUND`| 404 | `TourImplementationAssignedUserNotFoundException`| [`tour-implementation-assignment.service.ts`](../../src/tour/services/tour-implementation-assignment.service.ts) |
| `TOUR_IMPLEMENTATION_ASSIGNMENT_NOT_FOUND`| 404 | `TourImplementationAssignmentNotFoundException`| [`tour-implementation-assignment.service.ts`](../../src/tour/services/tour-implementation-assignment.service.ts) |
| `TOUR_SETTLEMENT_NOT_FOUND`             | 404  | `TourSettlementNotFoundException`        | [`tour-settlement.service.ts`](../../src/tour/services/tour-settlement.service.ts), [`signature.service.ts`](../../src/signature/signature.service.ts), [`receipt-payment.service.ts`](../../src/receipt-payment/services/receipt-payment.service.ts) |
| `TOUR_SETTLEMENT_CANCEL_LOG_NOT_FOUND`  | 404  | `TourSettlementCancelLogNotFoundException`| [`tour-settlement.service.ts`](../../src/tour/services/tour-settlement.service.ts)           |

### Signature · `signature.exception.ts`

| `error` code                          | HTTP | Exception class                         | Thrown by                                                                                     |
| ------------------------------------- | ---- | --------------------------------------- | --------------------------------------------------------------------------------------------- |
| `SIGNATURE_NOT_FOUND`                 | 404  | `SignatureNotFoundException`            | [`signature.service.ts`](../../src/signature/signature.service.ts), [`signature-mutation.guard.ts`](../../src/_core/guards/signature-mutation.guard.ts) |
| `SIGNATURE_ALREADY_SIGNED`            | 400  | `SignatureAlreadySignedException`       | [`signature.service.ts`](../../src/signature/signature.service.ts)                            |
| `SIGNATURE_NOT_AUTHORIZED`            | 403  | `SignatureNotAuthorizedException`       | [`signature.service.ts`](../../src/signature/signature.service.ts), [`signature-mutation.guard.ts`](../../src/_core/guards/signature-mutation.guard.ts) — sign/update/cancel by a non-target user |
| `SIGNATURE_RECEIVER_BEFORE_SENDER`    | 400  | `SignatureReceiverBeforeSenderException`| [`signature.service.ts`](../../src/signature/signature.service.ts)                            |
| `SIGNATURE_RECEIVER_INCLUDES_SENDER`  | 400  | `SignatureReceiverIncludesSenderException`| [`signature.service.ts`](../../src/signature/signature.service.ts)                          |
| `SIGNATURE_UNSUPPORTED_DOCUMENT_TYPE` | 400  | `SignatureUnsupportedDocumentTypeException`| [`signature.service.ts`](../../src/signature/signature.service.ts)                          |
| `SIGNATURE_BOOKING_COMPLETED_IMMUTABLE`| 400 | `SignatureBookingCompletedImmutableException`| [`signature.service.ts`](../../src/signature/signature.service.ts) — cannot cancel on a completed booking |
| `SIGNATURE_BOOKING_RECEIVER_ORG_MISSING`| 400 | `SignatureBookingReceiverOrgMissingException`| [`signature.service.ts`](../../src/signature/signature.service.ts) — the booking has no receiver linked to an organization |
| `SIGNATURE_NOT_RECEIVING_ORG_MEMBER`  | 403  | `SignatureNotReceivingOrgMemberException`| [`signature.service.ts`](../../src/signature/signature.service.ts) — caller is not a member of the receiving organization |

### Social-Link · `social-link.exception.ts`

| `error` code             | HTTP | Exception class                  | Thrown by                                                                     |
| ------------------------ | ---- | -------------------------------- | ---------------------------------------------------------------------------- |
| `SOCIAL_LINK_NOT_FOUND`  | 404  | `SocialLinkNotFoundException`    | [`social-link.service.ts`](../../src/social-link/social-link.service.ts)     |
| `SOCIAL_LINK_OWNER_REQUIRED`| 400 | `SocialLinkOwnerRequiredException`| [`social-link.service.ts`](../../src/social-link/social-link.service.ts) — must belong to a user or an organization |

### Fuel-Price · `fuel-price.exception.ts`

| `error` code            | HTTP | Exception class               | Thrown by                                                                    |
| ----------------------- | ---- | ----------------------------- | --------------------------------------------------------------------------- |
| `FUEL_PRICE_FETCH_FAILED`| 422 | `FuelPriceFetchFailedException`| [`fuel-price.service.ts`](../../src/fuel-price/fuel-price.service.ts) — the upstream VNExpress source failed |

### Upload · `upload.exception.ts`

| `error` code             | HTTP | Exception class                | Thrown by                                                       |
| ------------------------ | ---- | ------------------------------ | -------------------------------------------------------------- |
| `UPLOAD_FILE_REQUIRED`   | 400  | `UploadFileRequiredException`  | [`upload.controller.ts`](../../src/upload/upload.controller.ts) — raised by `ParseFilePipe` when no file is sent |
| `UPLOAD_INVALID_FILE_TYPE`| 415 | `UploadInvalidFileTypeException`| [`upload.controller.ts`](../../src/upload/upload.controller.ts) — `FileTypeValidator` (magic-number) rejects the type |
| `UPLOAD_FILE_TOO_LARGE`  | 413  | `UploadFileTooLargeException`  | [`upload.controller.ts`](../../src/upload/upload.controller.ts) — `MaxFileSizeValidator` rejects the size |
| `UPLOAD_PATH_REQUIRED`   | 400  | `UploadPathRequiredException`  | [`upload.service.ts`](../../src/upload/upload.service.ts)      |
| `UPLOAD_FILE_NOT_FOUND`  | 404  | `UploadFileNotFoundException`  | [`upload.service.ts`](../../src/upload/upload.service.ts)      |

### Document — cross-cutting signing lock · `document.exception.ts`

One shared code for "this document is frozen because signing has progressed", raised across every signable document type. It replaces the four per-type "…_SIGNED_IMMUTABLE" codes — the client renders the same "already signed, cannot change" state for all of them, so they collapse into one code (the human `message` still names the specific document).

| `error` code               | HTTP | Exception class                | Thrown by                                                                                     |
| -------------------------- | ---- | ------------------------------ | --------------------------------------------------------------------------------------------- |
| `DOCUMENT_LOCKED_AFTER_SIGN`| 409 | `DocumentLockedAfterSignException`| [`booking.service.ts`](../../src/booking/booking.service.ts), [`tour-calculation.service.ts`](../../src/tour/services/tour-calculation.service.ts), [`tour-settlement.service.ts`](../../src/tour/services/tour-settlement.service.ts), [`signature.service.ts`](../../src/signature/signature.service.ts) — update/remove blocked once the sender or a receiver has signed |

### System · `app-exception.filter.ts`

| `error` code            | HTTP | Source                                                                                                     |
| ----------------------- | ---- | ---------------------------------------------------------------------------------------------------------- |
| `INTERNAL_SERVER_ERROR` | 500  | Synthesized by the catch-all filter for any unknown throw — see [Exception Filter Pattern](../pattern/EXCEPTION-FILTER-PATTERN.md) |

---

## 2. Built-in exceptions thrown directly (no stable code)

> **Policy — default to a custom code.** Any error that is part of the app's *business surface* (something a client may branch on for UI, i18n, retry, or redirect) **must** be a custom exception from §1 with a stable `error` code. A bare built-in's `error` is only the HTTP reason phrase (`"Forbidden"`), which is *not* a trackable identifier. Reach for a bare built-in **only** when the situation is transport/framework-level or transient and the client needs nothing beyond the HTTP status. When in doubt, add a code.

**Acceptable bare uses:**

| HTTP | Exception class              | When                                                                                          |
| ---- | ---------------------------- | --------------------------------------------------------------------------------------------- |
| 501  | `NotImplementedException`    | Endpoint/branch stubbed but not built yet — temporary by nature; a code would only be deleted later. |
| 410  | `GoneException`              | A route/feature was intentionally removed; clients just stop calling it.                       |
| 503  | `ServiceUnavailableException`| Maintenance window / a downstream dependency is down. The client action is always "retry later" regardless of *why* — no per-cause branching. |
| 415  | `UnsupportedMediaTypeException` | Wrong `Content-Type`; a caller-integration bug, not a business state.                       |

---

## 3. Validation errors

| Trigger                                   | HTTP | Source                                                                                     |
| ----------------------------------------- | ---- | ------------------------------------------------------------------------------------------ |
| Any DTO / param that fails its Zod schema | 400  | `ZodValidationPipe` (`nestjs-zod`), registered globally in [`main.ts`](../../src/main.ts)  |

Body: `{ statusCode: 400, message: "Validation failed", errors: [...Zod issues] }`. There is **no `error` code** — tracking must match on `message === "Validation failed"` plus the `errors` array.

---

## How to add a new code

1. Add the class to the matching `src/_common/exceptions/<domain>.exception.ts` (create the file if the domain has none yet), extending the built-in that carries the right status (so it stays in that status's catch list), with body `{ error: 'STABLE_CODE', message, statusCode }`.
2. Pick a `SCREAMING_SNAKE_CASE` code, `<DOMAIN>_<REASON>`, unique across this reference.
3. Throw it from the service/guard — never build the response by hand ([§9](../CODING-CONVENTION.md#9-error-handling)).
4. Add a row to the correct table above.
5. Add the client-side copy keyed on the new code (see the client's error-copy map).
