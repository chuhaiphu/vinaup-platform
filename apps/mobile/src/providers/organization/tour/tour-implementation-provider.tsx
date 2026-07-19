import { useFetch, useMutationFn, type ApiError } from 'fetchwire';
import { createContext, useContext } from 'react';

import { createBooking } from '@/apis/booking/booking-apis';
import {
  getTourImplementationByTourId,
  updateTourImplementation as updateTourImplementationFn,
  manageMembersAssigned as manageMembersAssignedFn,
  createAssignment as createAssignmentFn,
  updateAssignment as updateAssignmentFn,
  updateUserAssigned as updateUserAssignedFn,
  deleteAssignment as deleteAssignmentFn,
} from '@/apis/tour/tour-implementation-apis';
import {
  getBookingRippleTags,
  FETCH_TAG,
  getTourImplementationAssignmentRippleTags,
} from '@/constants/fetch-tag-constants';
import {
  TourImplementationWithMeta,
  TourImplementationAssignmentWithMeta,
  UpdateTourImplementationRequest,
  UpdateTourImplementationAssignmentRequest,
  UpdateUserAssignedRequest,
} from '@/interfaces/tour-implementation-interfaces';
import { useAuthContext } from '@/providers/auth/auth-provider';
import { generateDateCode } from '@/utils/generator/string-generator/generate-date-code';

interface TourImplementationContextType {
  tourImplementation: TourImplementationWithMeta;
  isMemberAssigned: boolean;
  canViewTourGuideReceiptPayments: boolean;
  canViewBooking: boolean;
  isUpdatingImplementation: boolean;
  refreshTourImplementation: () => void;
  updateTourImplementation: (
    data: UpdateTourImplementationRequest,
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => void;
  manageMembersAssigned: (
    organizationMemberIds: string[],
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => void;
  createAssignment: (callbacks?: {
    onSuccess?: (item: TourImplementationAssignmentWithMeta | null) => void;
    onError?: (e: ApiError) => void;
  }) => void;
  updateAssignment: (
    params: { id: string; data: UpdateTourImplementationAssignmentRequest },
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => void;
  updateUserAssigned: (
    params: { id: string; data: UpdateUserAssignedRequest },
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => void;
  isUpdatingAssignment: boolean;
  createBookingForTourImplementation: (
    organizationId: string,
    callbacks?: { onSuccess?: (data: { id: string }) => void; onError?: (e: ApiError) => void },
  ) => void;
  isCreatingBooking: boolean;
  isCreatingAssignment: boolean;
  deleteAssignment: (
    assignmentId: string,
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => void;
  isDeletingAssignment: boolean;
}

const TourImplementationContext = createContext<TourImplementationContextType | null>(null);

export function useTourImplementationContext() {
  const ctx = useContext(TourImplementationContext);
  if (!ctx)
    throw new Error('useTourImplementationContext must be used within TourImplementationProvider');
  return ctx;
}

export function TourImplementationProvider({
  tourId,
  children,
}: {
  tourId: string;
  children: React.ReactNode;
}) {
  // ─── Step 1: Suspense-based fetch ─────
  // useFetch (not useFetchFn) so the provider suspends until the entity is
  // loaded — this is what lets the screen mount a <Suspense> skeleton and
  // guarantees `tourImplementation` is non-null for every descendant.
  const { data: tourImplementation, refreshFetch: refreshTourImplementation } = useFetch(
    () => getTourImplementationByTourId(tourId),
    {
      fetchKey: `tour-implementation-${tourId}`,
      tags: [
        FETCH_TAG.tourImplementationByTourId(tourId),
        FETCH_TAG.tourImplementationAssignmentList,
      ],
    },
  );

  const { currentUser } = useAuthContext();

  const isMemberAssigned = tourImplementation?.meta?.canEdit ?? false;

  const currentUserAssignedPermissions = (tourImplementation?.tourImplementationAssignments ?? [])
    .flatMap((assignment) => assignment.usersAssigned)
    .filter((u) => u.userId === currentUser?.id)
    .flatMap((u) => u.permissions);

  const canViewTourGuideReceiptPayments =
    isMemberAssigned ||
    currentUserAssignedPermissions.includes('RECEIPT_PAYMENT_FOR_TOUR_GUIDE_READ');

  const canViewBooking =
    isMemberAssigned || currentUserAssignedPermissions.includes('BOOKING_READ');

  const { executeMutationFn: execUpdateImplementation, isMutating: isUpdatingImplementation } =
    useMutationFn(
      (data: UpdateTourImplementationRequest) =>
        updateTourImplementationFn(tourImplementation?.id || '', data),
      { invalidatesTags: [FETCH_TAG.tourImplementationByTourId(tourId)] },
    );

  const { executeMutationFn: execManageMembers } = useMutationFn(
    (organizationMemberIds: string[]) =>
      manageMembersAssignedFn(tourImplementation?.id || '', { organizationMemberIds }),
    { invalidatesTags: [FETCH_TAG.tourImplementationByTourId(tourId)] },
  );

  const updateTourImplementation = (
    data: UpdateTourImplementationRequest,
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => execUpdateImplementation(data, callbacks);

  const manageMembersAssigned = (
    organizationMemberIds: string[],
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => execManageMembers(organizationMemberIds, callbacks);

  const { executeMutationFn: execCreateAssignment, isMutating: isCreatingAssignment } =
    useMutationFn(() => createAssignmentFn(tourImplementation?.id || ''), {
      invalidatesTags: getTourImplementationAssignmentRippleTags(),
    });

  const { executeMutationFn: execUpdateAssignment, isMutating: isUpdatingAssignmentItself } =
    useMutationFn(
      ({ id, data }: { id: string; data: UpdateTourImplementationAssignmentRequest }) =>
        updateAssignmentFn(id, data),
      { invalidatesTags: getTourImplementationAssignmentRippleTags() },
    );

  const { executeMutationFn: execUpdateUserAssigned, isMutating: isUpdatingUserAssigned } =
    useMutationFn(
      ({ id, data }: { id: string; data: UpdateUserAssignedRequest }) =>
        updateUserAssignedFn(id, data),
      { invalidatesTags: getTourImplementationAssignmentRippleTags() },
    );

  const isUpdatingAssignment = isUpdatingAssignmentItself || isUpdatingUserAssigned;

  const { executeMutationFn: execCreateBooking, isMutating: isCreatingBooking } = useMutationFn(
    (organizationId: string) =>
      createBooking({
        code: generateDateCode(),
        description: 'Booking tour',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        organizationId,
        tourImplementationId: tourImplementation?.id || '',
      }),
    { invalidatesTags: getBookingRippleTags(tourImplementation?.id) },
  );

  const createAssignment = (callbacks?: {
    onSuccess?: (item: TourImplementationAssignmentWithMeta | null) => void;
    onError?: (e: ApiError) => void;
  }) => execCreateAssignment(callbacks);

  const updateAssignment = (
    params: { id: string; data: UpdateTourImplementationAssignmentRequest },
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => execUpdateAssignment(params, callbacks);

  const updateUserAssigned = (
    params: { id: string; data: UpdateUserAssignedRequest },
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => execUpdateUserAssigned(params, callbacks);

  const createBookingForTourImplementation = (
    organizationId: string,
    callbacks?: { onSuccess?: (data: { id: string }) => void; onError?: (e: ApiError) => void },
  ) => execCreateBooking(organizationId, callbacks as Parameters<typeof execCreateBooking>[1]);

  const { executeMutationFn: execDeleteAssignment, isMutating: isDeletingAssignment } =
    useMutationFn((assignmentId: string) => deleteAssignmentFn(assignmentId), {
      invalidatesTags: getTourImplementationAssignmentRippleTags(),
    });

  const deleteAssignment = (
    assignmentId: string,
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => execDeleteAssignment(assignmentId, callbacks);

  // ─── Non-null contract guard (PROVIDER-PATTERN Rule 5) ─────
  // useFetch suspends while loading, so reaching here means the entity is
  // loaded. Placed after every hook (Rules of Hooks) to narrow the type and
  // let the context expose `tourImplementation` as non-null.
  if (!tourImplementation) return null;

  return (
    <TourImplementationContext
      value={{
        tourImplementation,
        isMemberAssigned,
        canViewTourGuideReceiptPayments,
        canViewBooking,
        isUpdatingImplementation,
        isCreatingAssignment,
        isCreatingBooking,
        refreshTourImplementation,
        updateTourImplementation,
        manageMembersAssigned,
        createAssignment,
        updateAssignment,
        updateUserAssigned,
        isUpdatingAssignment,
        createBookingForTourImplementation,
        deleteAssignment,
        isDeletingAssignment,
      }}
    >
      {children}
    </TourImplementationContext>
  );
}
