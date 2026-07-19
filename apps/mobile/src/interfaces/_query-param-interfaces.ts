export type {
  BookingFilterRequestInterface as BookingFilterParam,
  CarFilterRequestInterface as CarFilterParam,
  InvoiceFilterRequestInterface as InvoiceFilterParam,
  ProjectFilterRequestInterface as ProjectFilterParam,
  ReceiptPaymentFilterRequestInterface as ReceiptPaymentFilterParam,
  TourFilterRequestInterface as TourFilterParam,
  TripFilterRequestInterface as TripFilterParam,
  WageFilterRequestInterface as WageFilterParam,
} from '@vinaup-platform/validation';

export interface DateFilterParam {
  startDate?: string;
  endDate?: string;
}
