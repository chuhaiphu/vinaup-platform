# CODE REVIEW

Systematic code review plan for the entire source codebase.

---

## How to Use

- Check `[x]` when a file has been fully reviewed.
- Review order: **foundation → infrastructure → utilities → routing → features (complex to simple)**.

---

## 1. Interfaces

Read first to understand data models.

### Meta & Query
- [ ] `src/interfaces/_meta.interfaces.ts`
- [ ] `src/interfaces/_query-param.interfaces.ts`

### Auth & User
- [ ] `src/interfaces/user-interfaces.ts`
- [ ] `src/interfaces/auth-interfaces.ts`

### Organization
- [ ] `src/interfaces/organization-industry-interfaces.ts`
- [ ] `src/interfaces/organization-role-interfaces.ts`
- [ ] `src/interfaces/social-link-interfaces.ts`
- [ ] `src/interfaces/signature-interfaces.ts`
- [ ] `src/interfaces/organization-interfaces.ts`
- [ ] `src/interfaces/organization-customer-interfaces.ts`
- [ ] `src/interfaces/organization-member-interfaces.ts`

### Project & Finance
- [ ] `src/interfaces/invoice-type-interfaces.ts`
- [ ] `src/interfaces/project-interfaces.ts`
- [ ] `src/interfaces/invoice-interfaces.ts`
- [ ] `src/interfaces/receipt-payment-interfaces.ts`
- [ ] `src/interfaces/booking-interfaces.ts`
- [ ] `src/interfaces/wage-interfaces.ts`

### Calendar
- [ ] `src/interfaces/calendar-interfaces.ts`

### Tour
- [ ] `src/interfaces/car-interfaces.ts`
- [ ] `src/interfaces/tour-interfaces.ts`
- [ ] `src/interfaces/tour-calculation-interfaces.ts`
- [ ] `src/interfaces/tour-settlement-interfaces.ts`
- [ ] `src/interfaces/tour-implementation-interfaces.ts`

---

## 2. Constants

- [ ] `src/constants/social-link-constants.ts`
- [ ] `src/constants/signature-constants.ts`
- [ ] `src/constants/receipt-payment-constants.ts`
- [ ] `src/constants/car-constants.ts`
- [ ] `src/constants/booking-constants.ts`
- [ ] `src/constants/tour-constants.ts`
- [ ] `src/constants/style-constant.ts`
- [ ] `src/constants/project-constants.ts`
- [ ] `src/constants/invoice-constants.ts`
- [ ] `src/constants/organization-constants.ts`
- [ ] `src/constants/wage-constants.ts`
- [x] `src/constants/app-constant.ts`

---

## 3. APIs

Repository pattern, organized by domain.

### Auth & User
- [ ] `src/apis/auth/auth-apis.ts`
- [ ] `src/apis/user/user-apis.ts`
- [ ] `src/apis/upload/upload-apis.ts`

### Social & Signature
- [ ] `src/apis/social-link/social-link-apis.ts`
- [ ] `src/apis/signature/signature-apis.ts`

### Organization
- [ ] `src/apis/organization/organization-role-apis.ts`
- [ ] `src/apis/organization/organization-customer-apis.ts`
- [ ] `src/apis/organization/organization-member-apis.ts`
- [ ] `src/apis/organization/organization-apis.ts`

### Category
- [ ] `src/apis/category/project-category-apis.ts`
- [ ] `src/apis/category/receipt-payment-category-apis.ts`

### Project & Finance
- [ ] `src/apis/project/project-apis.ts`
- [ ] `src/apis/invoice/invoice-apis.ts`
- [ ] `src/apis/receipt-payment/receipt-payment-apis.ts`
- [ ] `src/apis/booking/booking-apis.ts`
- [ ] `src/apis/wage/wage-apis.ts`

### Tour
- [ ] `src/apis/tour/tour-apis.ts`
- [ ] `src/apis/tour/tour-calculation-apis.ts`
- [ ] `src/apis/tour/tour-settlement-apis.ts`
- [ ] `src/apis/tour/tour-implementation-apis.ts`

---

## 4. Providers

Context API + Zustand stores.

### Auth (Global)
- [ ] `src/providers/auth/auth-provider.tsx`
- [ ] `src/providers/auth/all-organizations-provider.tsx`
- [ ] `src/providers/auth/organization-provider.tsx`
- [ ] `src/providers/auth/owner-mode-provider.tsx`

### Organization
- [ ] `src/providers/organization/organization-actions-provider.tsx`
- [ ] `src/providers/organization/organization-home-summary-provider.tsx`
- [ ] `src/providers/organization/customer/organization-customer-provider.tsx`
- [ ] `src/providers/organization/member/organization-member-list-provider.tsx`
- [ ] `src/providers/organization/booking/organization-booking-list-provider.tsx`
- [ ] `src/providers/organization/booking/booking-detail-provider.tsx`
- [ ] `src/providers/organization/booking/booking-tour-implementation-list-provider.tsx`
- [ ] `src/providers/organization/invoice/organization-invoice-list-provider.tsx`
- [ ] `src/providers/organization/invoice/invoice-detail-provider.tsx`
- [ ] `src/providers/organization/invoice/invoice-type-provider.tsx`
- [ ] `src/providers/organization/project/organization-project-list-provider.tsx`
- [ ] `src/providers/organization/project/organization-project-detail-provider.tsx`
- [ ] `src/providers/organization/tour/organization-tour-list-provider.tsx`
- [ ] `src/providers/organization/tour/tour-detail-provider.tsx`
- [ ] `src/providers/organization/tour/tour-calculation-provider.tsx`
- [ ] `src/providers/organization/tour/tour-settlement-provider.tsx`
- [ ] `src/providers/organization/tour/tour-implementation-provider.tsx`
- [ ] `src/providers/organization/tour/receipt-payment-list-in-tour-implementation-provider.tsx`
- [ ] `src/providers/organization/tour/tour-calculation-cancel-log-detail-provider.tsx`
- [ ] `src/providers/organization/tour/tour-settlement-cancel-log-detail-provider.tsx`

### Personal
- [ ] `src/providers/personal/personal-actions-provider.tsx`
- [ ] `src/providers/personal/personal-home-summary-provider.tsx`
- [ ] `src/providers/personal/project/personal-project-list-provider.tsx`
- [ ] `src/providers/personal/project/personal-project-detail-provider.tsx`
- [ ] `src/providers/personal/project/personal-project-category-provider.tsx`
- [ ] `src/providers/personal/wage/personal-wage-list-provider.tsx`
- [ ] `src/providers/personal/wage/personal-wage-detail-provider.tsx`
- [ ] `src/providers/personal/calendar/project-calendar-provider.tsx`
- [ ] `src/providers/personal/calendar/wage-calendar-provider.tsx`

### Commons
- [ ] `src/providers/commons/receipt-payment/receipt-payment-form-provider.tsx`
- [ ] `src/providers/commons/receipt-payment/receipt-payment-category-provider.tsx`
- [ ] `src/providers/commons/receipt-payment/receipt-payment-list-in-booking-provider.tsx`
- [ ] `src/providers/commons/receipt-payment/receipt-payment-list-in-invoice-provider.tsx`
- [ ] `src/providers/commons/receipt-payment/receipt-payment-list-in-project-provider.tsx`
- [ ] `src/providers/commons/receipt-payment/receipt-payment-list-in-wage-provider.tsx`

---

## 5. Hooks

Custom hooks + Zustand stores.

- [ ] `src/hooks/use-navigation-store.ts`
- [ ] `src/hooks/use-personal-utility-store.ts`
- [ ] `src/hooks/use-organization-utility-store.ts`
- [ ] `src/hooks/use-receipt-payment-form-store.ts`
- [ ] `src/hooks/use-toast-store.ts`
- [ ] `src/hooks/use-format-number-input.ts`
- [ ] `src/hooks/use-screen-header.tsx`

---

## 6. Utils

### Calculator
- [ ] `src/utils/calculator/calculate-receipt-payments-summary.ts`
- [ ] `src/utils/calculator/calculate-tour-ticket-summaries.ts`
- [ ] `src/utils/calculator/calculate-complement-days-in-month.ts`

### String Generator
- [x] `src/utils/generator/string-generator/generate-locale-format-string.ts`
- [ ] `src/utils/generator/string-generator/generate-date-code.ts`
- [x] `src/utils/generator/string-generator/generate-date-range.ts`
- [ ] `src/utils/generator/string-generator/generate-format-date-time.ts`
- [ ] `src/utils/generator/string-generator/generate-base64-from-url.ts`
- [x] `src/utils/generator/string-generator/generate-day-js-date-chain.ts`
- [ ] `src/utils/generator/string-generator/generate-error-message.ts`
- [ ] `src/utils/generator/string-generator/generate-filter-query-string.ts`
- [ ] `src/utils/generator/string-generator/generate-raw-number.ts`

### File Generator — PDF
- [ ] `src/utils/generator/file-generator/pdf/create-and-share-pdf.ts`
- [ ] `src/utils/generator/file-generator/pdf/create-and-share-tour-calculation-cancel-log-pdf.ts`
- [ ] `src/utils/generator/file-generator/pdf/create-and-share-tour-settlement-cancel-log-pdf.ts`

### File Generator — HTML
- [ ] `src/utils/generator/file-generator/html/generate-tour-cancel-log-html.ts`

---

## 7. App / Routes

Expo Router file-based routing.

### Root Layout & Auth
- [ ] `src/app/_layout.tsx`
- [ ] `src/app/login.tsx`
- [ ] `src/app/register.tsx`

### Protected Root
- [ ] `src/app/(protected)/_layout.tsx`
- [ ] `src/app/(protected)/index.tsx`

### Personal Tabs
- [ ] `src/app/(protected)/personal/(tabs)/_layout.tsx`
- [ ] `src/app/(protected)/personal/(tabs)/profile.tsx`
- [ ] `src/app/(protected)/personal/(tabs)/wage.tsx`
- [ ] `src/app/(protected)/personal/(tabs)/project.tsx`
- [ ] `src/app/(protected)/personal/(tabs)/calendar.tsx`
- [ ] `src/app/(protected)/personal/(tabs)/index.tsx`

### Organization Tabs
- [ ] `src/app/(protected)/organization/[organizationId]/_layout.tsx`
- [ ] `src/app/(protected)/organization/[organizationId]/(tabs)/_layout.tsx`
- [ ] `src/app/(protected)/organization/[organizationId]/(tabs)/profile.tsx`
- [ ] `src/app/(protected)/organization/[organizationId]/(tabs)/tour.tsx`
- [ ] `src/app/(protected)/organization/[organizationId]/(tabs)/booking.tsx`
- [ ] `src/app/(protected)/organization/[organizationId]/(tabs)/project.tsx`
- [ ] `src/app/(protected)/organization/[organizationId]/(tabs)/invoice.tsx`
- [ ] `src/app/(protected)/organization/[organizationId]/(tabs)/index.tsx`

### Detail Screens
- [ ] `src/app/(protected)/project-detail/[projectId].tsx`
- [ ] `src/app/(protected)/invoice-detail/[invoiceId].tsx`
- [ ] `src/app/(protected)/receipt-payment-detail/[receiptPaymentId].tsx`
- [ ] `src/app/(protected)/wage-detail/[wageId].tsx`
- [ ] `src/app/(protected)/booking-detail/[bookingId]/index.tsx`
- [ ] `src/app/(protected)/booking-detail/[bookingId]/booking-detail-preview.tsx`

### Tour Detail
- [ ] `src/app/(protected)/tour-detail/[tourId]/_layout.tsx`
- [ ] `src/app/(protected)/tour-detail/[tourId]/index.tsx`
- [ ] `src/app/(protected)/tour-detail/[tourId]/tour-calculation.tsx`
- [ ] `src/app/(protected)/tour-detail/[tourId]/tour-settlement.tsx`
- [ ] `src/app/(protected)/tour-detail/[tourId]/tour-implementation.tsx`

### Tour Cancel Log Details
- [ ] `src/app/(protected)/tour-settlement-cancel-log-detail/[tourSettlementCancelLogId].tsx`
- [ ] `src/app/(protected)/tour-calculation-cancel-log-detail/[tourCalculationCancelLogId].tsx`

---

## 8. Components: Primitives

Fundamental UI building blocks.

- [ ] `src/components/primitives/pressable-opacity.tsx`
- [ ] `src/components/primitives/error-boundary.tsx`
- [ ] `src/components/primitives/button.tsx`
- [ ] `src/components/primitives/loader.tsx`
- [ ] `src/components/primitives/pressable-card.tsx`
- [ ] `src/components/primitives/avatar.tsx`
- [ ] `src/components/primitives/carousel.tsx`
- [ ] `src/components/primitives/text-switcher.tsx`
- [ ] `src/components/primitives/text-toggler.tsx`
- [ ] `src/components/primitives/segmented-control.tsx`
- [ ] `src/components/primitives/unified-date-picker.tsx`
- [ ] `src/components/primitives/skeleton.tsx`
- [ ] `src/components/primitives/flat-text-input.tsx`
- [ ] `src/components/primitives/toast.tsx`
- [x] `src/components/primitives/single-select/` — refactored to directory
  - [x] `src/components/primitives/single-select/types.ts`
  - [x] `src/components/primitives/single-select/single-select.tsx`
  - [x] `src/components/primitives/single-select/index.ts`
- [ ] `src/components/primitives/popover.tsx`
- [ ] `src/components/primitives/tabs.tsx`
- [ ] `src/components/primitives/date-time-picker.tsx`
- [x] `src/components/primitives/multi-select/` — refactored to directory
  - [x] `src/components/primitives/multi-select/types.ts`
  - [x] `src/components/primitives/multi-select/multi-select.tsx`
  - [x] `src/components/primitives/multi-select/index.ts`
- [ ] `src/components/primitives/slide-sheet.tsx`
- [ ] `src/components/primitives/month-year-picker.tsx`

---

## 9. Components: Icons

SVG icon components (native).

- [ ] `src/components/icons/vinaup-add-new.native.tsx`
- [ ] `src/components/icons/vinaup-calendar-icon.tsx`
- [ ] `src/components/icons/vinaup-circle-horizontal-half-arrow.native.tsx`
- [ ] `src/components/icons/vinaup-cog.native.tsx`
- [ ] `src/components/icons/vinaup-double-check.native.tsx`
- [ ] `src/components/icons/vinaup-earth-logo-color.native.tsx`
- [ ] `src/components/icons/vinaup-earth-logo.native.tsx`
- [ ] `src/components/icons/vinaup-expand.native.tsx`
- [ ] `src/components/icons/vinaup-eye-square.native.tsx`
- [ ] `src/components/icons/vinaup-home.native.tsx`
- [ ] `src/components/icons/vinaup-info-circle.native.tsx`
- [ ] `src/components/icons/vinaup-info-note.native.tsx`
- [ ] `src/components/icons/vinaup-left-arrow-separator.native.tsx`
- [ ] `src/components/icons/vinaup-left-arrow-two-layers.native.tsx`
- [ ] `src/components/icons/vinaup-left-right-arrows.native.tsx`
- [ ] `src/components/icons/vinaup-lock.native.tsx`
- [ ] `src/components/icons/vinaup-logo-primary.native.tsx`
- [ ] `src/components/icons/vinaup-pen-line-outline.native.tsx`
- [ ] `src/components/icons/vinaup-pen-line.native.tsx`
- [ ] `src/components/icons/vinaup-plus-minus-multiply-equal.native.tsx`
- [ ] `src/components/icons/vinaup-plus-minus.native.tsx`
- [ ] `src/components/icons/vinaup-right-arrow-separator.native.tsx`
- [ ] `src/components/icons/vinaup-right-arrow-with-fill.native.tsx`
- [ ] `src/components/icons/vinaup-save-and-exit.native.tsx`
- [ ] `src/components/icons/vinaup-save-icon.native.tsx`
- [ ] `src/components/icons/vinaup-selector.native.tsx`
- [ ] `src/components/icons/vinaup-signing-pen-with-frame.native.tsx`
- [ ] `src/components/icons/vinaup-signing-pen.native.tsx`
- [ ] `src/components/icons/vinaup-text-logo.native.tsx`
- [ ] `src/components/icons/vinaup-unlock.native.tsx`
- [ ] `src/components/icons/vinaup-user-arrow-up-right.native.tsx`
- [ ] `src/components/icons/vinaup-user-checked.native.tsx`
- [ ] `src/components/icons/vinaup-utility-shape.native.tsx`
- [ ] `src/components/icons/vinaup-vertical-expand-arrow.native.tsx`
- [ ] `src/components/icons/vinaup-vertical-half-arrow.native.tsx`

---

## 10. Components: Commons

Shared UI across the entire app.

### Skeletons
- [ ] `src/components/commons/skeletons/index-shell-skeleton.tsx`
- [ ] `src/components/commons/skeletons/booking-list-section-skeleton.tsx`
- [ ] `src/components/commons/skeletons/entity-list-section-skeleton.tsx`
- [ ] `src/components/commons/skeletons/entity-detail-skeleton.tsx`
- [ ] `src/components/commons/skeletons/pane-skeleton.tsx`
- [ ] `src/components/commons/skeletons/booking-card-skeleton.tsx`
- [ ] `src/components/commons/skeletons/entity-card-skeleton.tsx`
- [ ] `src/components/commons/skeletons/flat-input-form-skeleton.tsx`

### Grids
- [ ] `src/components/commons/grids/index-utility-grid.tsx`

### Bars
- [ ] `src/components/commons/bars/receipt-payments-summary-bar.tsx`

### Cards
- [ ] `src/components/commons/cards/project-card.tsx`

### Signature
- [ ] `src/components/commons/signature/signature-entity.tsx`

### Selectors
- [ ] `src/components/commons/selectors/owner-selector/owner-selector.tsx`
- [ ] `src/components/commons/selectors/navigator-selector/personal-navigator-selector.tsx`

### Receipt Payment
- [x] `src/components/commons/receipt-payment/receipt-payment-card/` — refactored to directory
  - [x] `src/components/commons/receipt-payment/receipt-payment-card/receipt-payment-card.tsx`
  - [x] `src/components/commons/receipt-payment/receipt-payment-card/receipt-payment-card.styles.ts`
  - [x] `src/components/commons/receipt-payment/receipt-payment-card/index.ts`
- [x] `src/components/commons/receipt-payment/receipt-payment-form/` — refactored to directory
  - [x] `src/components/commons/receipt-payment/receipt-payment-form/receipt-payment-form.tsx`
  - [x] `src/components/commons/receipt-payment/receipt-payment-form/receipt-payment-form.styles.ts`
  - [x] `src/components/commons/receipt-payment/receipt-payment-form/index.ts`
- [ ] `src/components/commons/receipt-payment/receipt-payment-category-input/receipt-payment-category-input.tsx`
- [ ] `src/components/commons/receipt-payment/receipt-payment-category-input/receipt-payment-category-create-modal.tsx`
- [ ] `src/components/commons/receipt-payment/receipt-payment-category-input/receipt-payment-category-update-modal.tsx`
- [ ] `src/components/commons/receipt-payment/receipt-payment-category-select-modal/receipt-payment-category-select-modal.tsx`
- [ ] `src/components/commons/receipt-payment/receipt-payment-category-select-modal/receipt-payment-category-select-modal-content.tsx`
- [ ] `src/components/commons/receipt-payment/receipt-payment-list-in-project.tsx`
- [ ] `src/components/commons/receipt-payment/receipt-payment-list-in-wage.tsx`

### Headers
- [ ] `src/components/commons/headers/home-header/home-header.tsx`
- [ ] `src/components/commons/headers/home-header/organization-index-header-bottom.tsx`
- [ ] `src/components/commons/headers/home-header/organization-tour-header-bottom.tsx`
- [ ] `src/components/commons/headers/home-header/organization-booking-header-bottom.tsx`
- [ ] `src/components/commons/headers/home-header/organization-invoice-header-bottom.tsx`
- [ ] `src/components/commons/headers/home-header/organization-project-header-bottom.tsx`
- [ ] `src/components/commons/headers/home-header/personal-index-header-bottom.tsx`
- [ ] `src/components/commons/headers/home-header/personal-receipt-payment-header-bottom.tsx`
- [ ] `src/components/commons/headers/home-header/personal-wage-header-bottom.tsx`
- [ ] `src/components/commons/headers/home-header/personal-calendar-header-bottom.tsx`
- [ ] `src/components/commons/headers/home-header/personal-project-header-bottom.tsx`
- [ ] `src/components/commons/headers/receipt-payment-section-list-header.tsx`
- [ ] `src/components/commons/headers/screen-header.tsx`

### Modals
- [ ] `src/components/commons/modals/confirm-modal/confirm-modal.tsx`
- [ ] `src/components/commons/modals/create-organization-customer-modal/create-organization-customer-modal.tsx`
- [ ] `src/components/commons/modals/create-organization-customer-modal/create-organization-customer-modal-content.tsx`
- [ ] `src/components/commons/modals/organization-customer-select-modal/org-customer-select-modal.tsx`
- [ ] `src/components/commons/modals/organization-customer-select-modal/org-customer-internal-list.tsx`
- [ ] `src/components/commons/modals/organization-customer-select-modal/org-customer-real-list.tsx`
- [ ] `src/components/commons/modals/organization-member-select-modal/org-mem-select-modal.tsx`
- [ ] `src/components/commons/modals/organization-member-select-modal/org-mem-select-modal-content.tsx`
- [ ] `src/components/commons/modals/signer-select-modal/signer-select-modal.tsx`
- [ ] `src/components/commons/modals/signer-select-modal/signer-select-modal-content.tsx`
- [ ] `src/components/commons/modals/simple-number-input-modal/simple-number-input-modal.tsx`
- [ ] `src/components/commons/modals/simple-number-input-modal/simple-number-input-modal-content.tsx`
- [ ] `src/components/commons/modals/simple-text-input-modal/simple-text-input-modal.tsx`
- [ ] `src/components/commons/modals/simple-text-input-modal/simple-text-input-modal-content.tsx`
- [ ] `src/components/commons/modals/advance-input-modal/advance-input-modal.tsx`
- [ ] `src/components/commons/modals/advance-input-modal/advance-input-modal-content.tsx`
- [ ] `src/components/commons/modals/deposit-input-modal/deposit-input-modal.tsx`
- [ ] `src/components/commons/modals/deposit-input-modal/deposit-input-modal-content.tsx`
- [ ] `src/components/commons/modals/utility-select-modal/utility-select-modal.tsx`
- [ ] `src/components/commons/modals/pdf-page-size-modal/pdf-page-size-modal.tsx`

### Screen Contents
- [ ] `src/components/commons/screen-contents/receipt-payment-detail-screen-content.tsx`

---

## 11. Components: Auth

- [ ] `src/components/auth/screen-contents/login-screen-content.tsx`
- [ ] `src/components/auth/screen-contents/register-screen-content.tsx`

---

## 12. Components: Org / Tour

Most complex feature.

### List
- [ ] `src/components/organization/tour/list/tour-card.tsx`
- [ ] `src/components/organization/tour/list/organization-tour-list-section.tsx`

### Detail
- [ ] `src/components/organization/tour/detail/organization-tour-detail-tab-list.tsx`
- [ ] `src/components/organization/tour/detail/tour-detail-header.tsx`
- [ ] `src/components/organization/tour/detail/tour-detail-footer.tsx`
- [ ] `src/components/organization/tour/detail/modals/tour-info-modal/tour-info-modal.tsx`
- [ ] `src/components/organization/tour/detail/modals/tour-info-modal/tour-info-modal-content.tsx`
- [ ] `src/components/organization/tour/detail/modals/tour-org-customer-select-modal/tour-org-customer-select-modal.tsx`

### Shared
- [ ] `src/components/organization/tour/shared/popovers/tour-signature-info-popover.tsx`
- [ ] `src/components/organization/tour/shared/popovers/tour-ticket-summary-popover.tsx`
- [ ] `src/components/organization/tour/shared/popovers/tour-ticket-summary-info-popover.tsx`
- [ ] `src/components/organization/tour/shared/modals/tour-tax-input-modal/tour-tax-input-modal.tsx`
- [ ] `src/components/organization/tour/shared/modals/tour-tax-input-modal/tour-tax-input-modal-content.tsx`
- [ ] `src/components/organization/tour/shared/modals/tour-ticket-form-modal/tour-ticket-form-modal.tsx`
- [ ] `src/components/organization/tour/shared/modals/tour-ticket-form-modal/tour-ticket-form-modal-content.tsx`

### Tour Calculation
- [ ] `src/components/organization/tour/tour-calculation/sections/tour-calculation-ticket-summary.tsx`
- [ ] `src/components/organization/tour/tour-calculation/sections/tour-calculation-ticket-summary-skeleton.tsx`
- [ ] `src/components/organization/tour/tour-calculation/sections/tour-calculation-ticket-summary-receipt-payment-list.tsx`
- [ ] `src/components/organization/tour/tour-calculation/sections/receipt-payment-list-in-tour-calculation.tsx`
- [ ] `src/components/organization/tour/tour-calculation/sections/tour-calculation-signature-section.tsx`
- [ ] `src/components/organization/tour/tour-calculation/modals/tour-calculation-cancel-log-modal/tour-calculation-cancel-log-modal.tsx`
- [ ] `src/components/organization/tour/tour-calculation/modals/tour-calculation-cancel-log-modal/tour-calculation-cancel-log-modal-content.tsx`
- [ ] `src/components/organization/tour/tour-calculation/screen-contents/tour-calculation-screen-content.tsx`
- [ ] `src/components/organization/tour/tour-calculation/screen-contents/tour-calculation-cancel-log-detail-screen-content.tsx`

### Tour Settlement
- [ ] `src/components/organization/tour/tour-settlement/sections/tour-settlement-ticket-summary.tsx`
- [ ] `src/components/organization/tour/tour-settlement/sections/tour-settlement-ticket-summary-skeleton.tsx`
- [ ] `src/components/organization/tour/tour-settlement/sections/tour-settlement-ticket-summary-receipt-payment-list.tsx`
- [ ] `src/components/organization/tour/tour-settlement/sections/receipt-payment-list-in-tour-settlement.tsx`
- [ ] `src/components/organization/tour/tour-settlement/sections/tour-settlement-signature-section.tsx`
- [ ] `src/components/organization/tour/tour-settlement/modals/tour-settlement-cancel-log-modal/tour-settlement-cancel-log-modal.tsx`
- [ ] `src/components/organization/tour/tour-settlement/modals/tour-settlement-cancel-log-modal/tour-settlement-cancel-log-modal-content.tsx`
- [ ] `src/components/organization/tour/tour-settlement/screen-contents/tour-settlement-screen-content.tsx`
- [ ] `src/components/organization/tour/tour-settlement/screen-contents/tour-settlement-cancel-log-detail-screen-content.tsx`

### Tour Implementation
- [ ] `src/components/organization/tour/tour-implementation/bars/tour-implementation-summary-bar.tsx`
- [ ] `src/components/organization/tour/tour-implementation/bars/tour-imlementation-summary-bar-tour-guide.tsx`
- [ ] `src/components/organization/tour/tour-implementation/sections/tour-implementation-description-section.tsx`
- [ ] `src/components/organization/tour/tour-implementation/sections/tour-implementation-mems-in-charge-section.tsx`
- [ ] `src/components/organization/tour/tour-implementation/sections/tour-implementation-assignment-section.tsx`
- [ ] `src/components/organization/tour/tour-implementation/sections/tour-implementation-home-skeleton.tsx`
- [ ] `src/components/organization/tour/tour-implementation/sections/receipt-payment-list-in-tour-implementation.tsx`
- [ ] `src/components/organization/tour/tour-implementation/tab-panels/tour-implementation-home-tab-panel.tsx`
- [ ] `src/components/organization/tour/tour-implementation/tab-panels/tour-implementation-estimate-tab-panel.tsx`
- [ ] `src/components/organization/tour/tour-implementation/tab-panels/booking-tour-implementation-tab-panel.tsx`
- [ ] `src/components/organization/tour/tour-implementation/modals/tour-implementation-ticket-count-modal/tour-implementation-ticket-count-modal.tsx`
- [ ] `src/components/organization/tour/tour-implementation/modals/tour-implementation-ticket-count-modal/tour-implementation-ticket-count-modal-content.tsx`
- [ ] `src/components/organization/tour/tour-implementation/screen-contents/tour-implementation-screen-content.tsx`

---

## 13. Components: Org / Booking

- [ ] `src/components/organization/booking/booking-card.tsx`
- [ ] `src/components/organization/booking/list/booking-list-section.tsx`
- [ ] `src/components/organization/booking/detail/booking-detail-header.tsx`
- [ ] `src/components/organization/booking/detail/booking-detail-footer.tsx`
- [ ] `src/components/organization/booking/detail/booking-signature-section.tsx`
- [ ] `src/components/organization/booking/modals/booking-info-modal/booking-info-modal.tsx`
- [ ] `src/components/organization/booking/modals/booking-info-modal/booking-info-modal-content.tsx`
- [ ] `src/components/organization/booking/modals/booking-org-customer-select-modal/booking-org-customer-select-modal.tsx`
- [ ] `src/components/organization/booking/popovers/booking-signature-popover.tsx`
- [ ] `src/components/organization/booking/receipt-payment-list-in-booking.tsx`
- [ ] `src/components/organization/booking/screen-contents/booking-detail-screen-content.tsx`
- [ ] `src/components/organization/booking/screen-contents/booking-detail-preview-screen-content.tsx`

---

## 14. Components: Org / Invoice

- [ ] `src/components/organization/invoice/invoice-card.tsx`
- [ ] `src/components/organization/invoice/list/invoice-list-section.tsx`
- [ ] `src/components/organization/invoice/detail/invoice-detail-header.tsx`
- [ ] `src/components/organization/invoice/detail/invoice-detail-footer.tsx`
- [ ] `src/components/organization/invoice/bars/organization-invoice-summary-bar.tsx`
- [ ] `src/components/organization/invoice/modals/invoice-info-modal/invoice-info-modal.tsx`
- [ ] `src/components/organization/invoice/modals/invoice-info-modal/invoice-info-modal-content.tsx`
- [ ] `src/components/organization/invoice/modals/invoice-org-customer-select-modal/invoice-org-customer-select-modal.tsx`
- [ ] `src/components/organization/invoice/receipt-payment-list-in-invoice.tsx`
- [ ] `src/components/organization/invoice/screen-contents/invoice-detail-screen-content.tsx`

---

## 15. Components: Org / Project

- [ ] `src/components/organization/project/list/organization-project-list-section.tsx`
- [ ] `src/components/organization/project/detail/organization-project-detail-header.tsx`
- [ ] `src/components/organization/project/detail/organization-project-detail-footer.tsx`
- [ ] `src/components/organization/project/modals/organization-project-info-modal/organization-project-info-modal.tsx`
- [ ] `src/components/organization/project/modals/organization-project-info-modal/organization-project-info-modal-content.tsx`
- [ ] `src/components/organization/project/modals/organization-project-org-customer-select-modal/organization-project-org-customer-select-modal.tsx`
- [ ] `src/components/organization/project/screen-contents/organization-project-detail-screen-content.tsx`

---

## 16. Components: Org / Home & Screen Contents

### Home
- [ ] `src/components/organization/home/organization-home-index-summary.tsx`

### Screen Contents
- [ ] `src/components/organization/screen-contents/organization-index-screen-content.tsx`
- [ ] `src/components/organization/screen-contents/organization-tour-screen-content.tsx`
- [ ] `src/components/organization/screen-contents/organization-booking-screen-content.tsx`
- [ ] `src/components/organization/screen-contents/organization-invoice-screen-content.tsx`
- [ ] `src/components/organization/screen-contents/organization-project-screen-content.tsx`
- [ ] `src/components/organization/screen-contents/organization-profile-screen-content.tsx`

---

## 17. Components: Personal

### Home
- [ ] `src/components/personal/home/personal-home-index-summary.tsx`

### Calendar
- [ ] `src/components/personal/calendar/personal-calendar-list.tsx`
- [ ] `src/components/personal/calendar/personal-calendar-month-row.tsx`
- [ ] `src/components/personal/calendar/project-calendar.tsx`
- [ ] `src/components/personal/calendar/wage-calendar.tsx`

### Project
- [ ] `src/components/personal/project/list/personal-project-list-section.tsx`
- [ ] `src/components/personal/project/detail/personal-project-detail-header.tsx`
- [ ] `src/components/personal/project/detail/personal-project-detail-footer.tsx`
- [ ] `src/components/personal/project/bars/personal-project-summary-bar.tsx`
- [ ] `src/components/personal/project/selectors/personal-project-category-selector.tsx`
- [ ] `src/components/personal/project/modals/personal-project-info-modal/personal-project-info-modal.tsx`
- [ ] `src/components/personal/project/modals/personal-project-info-modal/personal-project-info-modal-content.tsx`
- [ ] `src/components/personal/project/modals/personal-project-category-select-modal/personal-project-category-select-modal.tsx`
- [ ] `src/components/personal/project/modals/personal-project-category-select-modal/personal-project-category-select-modal-content.tsx`
- [ ] `src/components/personal/project/modals/personal-project-category-select-modal/personal-project-category-input-modal.tsx`
- [ ] `src/components/personal/project/modals/personal-project-category-select-modal/personal-project-category-input-modal-content.tsx`
- [ ] `src/components/personal/project/modals/personal-project-org-customer-modal/personal-project-org-customer-modal.tsx`
- [ ] `src/components/personal/project/modals/personal-project-org-customer-modal/personal-project-org-customer-modal-content.tsx`
- [ ] `src/components/personal/project/screen-contents/personal-project-detail-screen-content.tsx`

### Wage
- [ ] `src/components/personal/wage/wage-card.tsx`
- [ ] `src/components/personal/wage/list/personal-wage-list-section.tsx`
- [ ] `src/components/personal/wage/detail/personal-wage-detail-header.tsx`
- [ ] `src/components/personal/wage/detail/personal-wage-detail-footer.tsx`
- [ ] `src/components/personal/wage/bars/personal-wage-summary-bar.tsx`
- [ ] `src/components/personal/wage/modals/personal-wage-info-modal/personal-wage-info-modal.tsx`
- [ ] `src/components/personal/wage/modals/personal-wage-info-modal/personal-wage-info-modal-content.tsx`
- [ ] `src/components/personal/wage/modals/personal-wage-org-customer-modal/personal-wage-org-customer-modal.tsx`
- [ ] `src/components/personal/wage/modals/personal-wage-org-customer-modal/personal-wage-org-customer-modal-content.tsx`
- [ ] `src/components/personal/wage/screen-contents/personal-wage-detail-screen-content.tsx`

### Screen Contents
- [ ] `src/components/personal/screen-contents/personal-index-screen-content.tsx`
- [ ] `src/components/personal/screen-contents/personal-project-screen-content.tsx`
- [ ] `src/components/personal/screen-contents/personal-wage-screen-content.tsx`
- [ ] `src/components/personal/screen-contents/personal-calendar-screen-content.tsx`
- [ ] `src/components/personal/screen-contents/personal-profile-screen-content.tsx`

---
