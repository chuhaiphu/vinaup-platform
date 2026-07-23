import dayjs from 'dayjs';
import { useMutationFn, type ApiError } from 'fetchwire';
import { createContext, useContext } from 'react';

import { createBooking } from '@/apis/booking/booking-apis';
import { createCar } from '@/apis/car/car-apis';
import { createInvoice } from '@/apis/invoice/invoice-apis';
import { createProject } from '@/apis/project/project-apis';
import { createTour } from '@/apis/tour/tour-apis';
import { createTrip } from '@/apis/trip/trip-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { INVOICE_TYPE, type InvoiceType } from '@/constants/invoice-constants';
import { BookingResponse } from '@/interfaces/booking-interfaces';
import { CarResponse } from '@/interfaces/car-interfaces';
import { InvoiceResponse } from '@/interfaces/invoice-interfaces';
import { ProjectResponse } from '@/interfaces/project-interfaces';
import { TourResponse } from '@/interfaces/tour-interfaces';
import { TripResponse } from '@/interfaces/trip-interfaces';
import { generateDateCode } from '@/utils/generator/string-generator/generate-date-code';

interface OrganizationActionsContextType {
  createInvoice: (
    params: { organizationId: string; invoiceType: InvoiceType },
    cb?: {
      onSuccess?: (data: InvoiceResponse | null) => void;
      onError?: (e: ApiError) => void;
    },
  ) => void;
  createBooking: (
    params: { organizationId: string },
    cb?: {
      onSuccess?: (data: BookingResponse | null) => void;
      onError?: (e: ApiError) => void;
    },
  ) => void;
  createProject: (
    params: { organizationId: string },
    cb?: {
      onSuccess?: (data: ProjectResponse | null) => void;
      onError?: (e: ApiError) => void;
    },
  ) => void;
  createTour: (
    params: { organizationId: string },
    cb?: {
      onSuccess?: (data: TourResponse | null) => void;
      onError?: (e: ApiError) => void;
    },
  ) => void;
  createCar: (
    params: { organizationId: string },
    cb?: {
      onSuccess?: (data: CarResponse | null) => void;
      onError?: (e: ApiError) => void;
    },
  ) => void;
  createTrip: (
    params: { organizationId: string },
    cb?: {
      onSuccess?: (data: TripResponse | null) => void;
      onError?: (e: ApiError) => void;
    },
  ) => void;
  isCreatingInvoice: boolean;
  isCreatingBooking: boolean;
  isCreatingProject: boolean;
  isCreatingTour: boolean;
  isCreatingCar: boolean;
  isCreatingTrip: boolean;
}

const OrganizationActionsContext = createContext<OrganizationActionsContextType | null>(null);

export function useOrganizationActionsContext() {
  const ctx = useContext(OrganizationActionsContext);
  if (!ctx)
    throw new Error(
      'useOrganizationActionsContext must be used within OrganizationActionsProvider',
    );
  return ctx;
}

export function OrganizationActionsProvider({ children }: { children: React.ReactNode }) {
  const { executeMutationFn: execCreateInvoice, isMutating: isCreatingInvoice } = useMutationFn(
    ({ organizationId, invoiceType }: { organizationId: string; invoiceType: InvoiceType }) =>
      createInvoice({
        code: generateDateCode(),
        type: invoiceType,
        description: invoiceType === INVOICE_TYPE.BUY ? 'Biên nhận chi' : 'Hoá đơn',
        endDate: new Date().toISOString(),
        startDate: new Date().toISOString(),
        organizationId,
      }),
    { invalidatesTags: [FETCH_TAG.invoiceList] },
  );

  const { executeMutationFn: execCreateBooking, isMutating: isCreatingBooking } = useMutationFn(
    ({ organizationId }: { organizationId: string }) =>
      createBooking({
        code: generateDateCode(),
        description: 'Booking mới',
        endDate: new Date().toISOString(),
        startDate: new Date().toISOString(),
        organizationId,
      }),
    { invalidatesTags: [FETCH_TAG.bookingList] },
  );

  const { executeMutationFn: execCreateProject, isMutating: isCreatingProject } = useMutationFn(
    ({ organizationId }: { organizationId: string }) =>
      createProject({
        code: generateDateCode(),
        description: 'Dự án',
        endDate: new Date().toISOString(),
        startDate: new Date().toISOString(),
        organizationId,
      }),
    { invalidatesTags: [FETCH_TAG.projectList] },
  );

  const { executeMutationFn: execCreateTour, isMutating: isCreatingTour } = useMutationFn(
    ({ organizationId }: { organizationId: string }) =>
      createTour({
        code: generateDateCode(),
        description: 'Tiêu đề tour',
        organizationId,
        externalCustomerName: 'Khách lẻ',
        startDate: dayjs().toISOString(),
        endDate: dayjs().add(3, 'day').toISOString(),
      }),
    { invalidatesTags: [FETCH_TAG.tourList] },
  );

  const { executeMutationFn: execCreateCar, isMutating: isCreatingCar } = useMutationFn(
    ({ organizationId }: { organizationId: string }) =>
      createCar({
        name: 'Xe 00X-00000',
        category: 'Ghế ngồi',
        model: '2026',
        seatCount: 24,
        manufacturer: 'Toyota',
        organizationId,
      }),
    { invalidatesTags: [FETCH_TAG.carList] },
  );

  const { executeMutationFn: execCreateTrip, isMutating: isCreatingTrip } = useMutationFn(
    ({ organizationId }: { organizationId: string }) =>
      createTrip({
        code: generateDateCode(),
        description: 'Tiêu đề chuyến',
        organizationId,
        externalCustomerName: 'Khách lẻ',
        startDate: dayjs().toISOString(),
        endDate: dayjs().add(1, 'day').toISOString(),
      }),
    { invalidatesTags: [FETCH_TAG.tripList] },
  );

  return (
    <OrganizationActionsContext
      value={{
        createInvoice: (params, cb) => execCreateInvoice(params, cb),
        createBooking: (params, cb) => execCreateBooking(params, cb),
        createProject: (params, cb) => execCreateProject(params, cb),
        createTour: (params, cb) => execCreateTour(params, cb),
        createCar: (params, cb) => execCreateCar(params, cb),
        createTrip: (params, cb) => execCreateTrip(params, cb),
        isCreatingInvoice,
        isCreatingBooking,
        isCreatingProject,
        isCreatingTour,
        isCreatingCar,
        isCreatingTrip,
      }}
    >
      {children}
    </OrganizationActionsContext>
  );
}
