export interface DateFilterParam {
  startDate?: string;
  endDate?: string;
}

export interface ProjectFilterParam extends DateFilterParam {
  type?: string;
  status?: string;
  categoryId?: string;
}

export interface InvoiceFilterParam extends DateFilterParam {
  invoiceTypeId?: string;
  status?: string;
}

export interface TourFilterParam extends DateFilterParam {
  status?: string;
}

export interface ReceiptPaymentFilterParam extends DateFilterParam {
  type?: 'RECEIPT' | 'PAYMENT';
}

export interface BookingFilterParam extends DateFilterParam {
  status?: string;
  tourImplementationId?: string;
}

export interface TripFilterParam extends DateFilterParam {
  status?: string;
}

export interface CarFilterParam extends DateFilterParam {
  name?: string;
  status?: string;
  category?: string;
  fuelType?: string;
}

export interface WageFilterParam extends DateFilterParam {
  status?: string;
}
