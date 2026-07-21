import { useRouter } from 'expo-router';
import { useFetch, useFetchFn, useMutationFn, type ApiError } from 'fetchwire';
import { createContext, useCallback, useContext } from 'react';
import { Alert } from 'react-native';

import {
  deleteBooking as deleteBookingFn,
  getBookingById,
  updateBooking as updateBookingFn,
} from '@/apis/booking/booking-apis';
import {
  getSignaturesByDocumentId,
  signSignature,
  cancelSignature,
} from '@/apis/signature/signature-apis';
import { getBookingRippleTags, FETCH_TAG } from '@/constants/fetch-tag-constants';
import { BookingWithMeta, UpdateBookingRequest } from '@/interfaces/booking-interfaces';
import { SignatureResponse } from '@/interfaces/signature-interfaces';
import { OrganizationAbilityProvider } from '@/providers/organization/organization-ability-provider';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

interface BookingDetailContextType {
  bookingId: string;
  booking: BookingWithMeta;
  canEdit: boolean;
  isRefreshingBooking: boolean;
  isUpdatingBooking: boolean;
  isDeletingBooking: boolean;
  handleUpdateBooking: (fields: UpdateBookingRequest, onSuccess?: () => void) => void;
  handleDelete: (onStart?: () => void, onFinish?: () => void) => void;
  refreshBooking: () => void;
  signatures: SignatureResponse[];
  isLoadingSignatures: boolean;
  fetchSignatures: () => void;
  refreshSignatures: () => void;
  signBooking: (
    id: string,
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => void;
  cancelBooking: (
    id: string,
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => void;
  isSigningBooking: boolean;
  isCancelingBooking: boolean;
}

const BookingDetailContext = createContext<BookingDetailContextType | null>(null);

export function useBookingDetailContext() {
  const ctx = useContext(BookingDetailContext);
  if (!ctx) throw new Error('useBookingDetailContext must be used within BookingDetailProvider');
  return ctx;
}

export function BookingDetailProvider({
  bookingId,
  children,
}: {
  bookingId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const {
    data: booking,
    isRefreshing: isRefreshingBooking,
    refreshFetch: refreshBooking,
  } = useFetch(() => getBookingById(bookingId), {
    fetchKey: `organization-booking-${bookingId}`,
    tags: [FETCH_TAG.bookingByBookingId(bookingId)],
  });

  const {
    data: signaturesData,
    isLoading: isLoadingSignatures,
    executeFetchFn: fetchSignatures,
    refreshFetchFn: refreshSignatures,
  } = useFetchFn(() => getSignaturesByDocumentId(bookingId), {
    fetchKey: `signature-list-in-booking-${bookingId}`,
    tags: [FETCH_TAG.signatureListInBookingByBookingId(bookingId)],
  });

  const signInvalidateTags = [
    ...getBookingRippleTags(booking?.tourImplementationId),
    FETCH_TAG.bookingByBookingId(bookingId),
    FETCH_TAG.signatureListInBookingByBookingId(bookingId),
  ];

  const { executeMutationFn: execSignBooking, isMutating: isSigningBooking } = useMutationFn(
    (id: string) => signSignature(id),
    { invalidatesTags: signInvalidateTags },
  );

  const { executeMutationFn: execCancelBooking, isMutating: isCancelingBooking } = useMutationFn(
    (id: string) => cancelSignature(id),
    { invalidatesTags: signInvalidateTags },
  );

  const signBooking = (
    id: string,
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => execSignBooking(id, callbacks);
  const cancelBooking = (
    id: string,
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => execCancelBooking(id, callbacks);

  const { executeMutationFn: updateBooking, isMutating: isUpdatingBooking } = useMutationFn(
    (updatedFields: UpdateBookingRequest) => updateBookingFn(bookingId, updatedFields),
    {
      invalidatesTags: [
        ...getBookingRippleTags(booking?.tourImplementationId),
        FETCH_TAG.bookingByBookingId(bookingId),
      ],
    },
  );

  const deleteInvalidateTags = getBookingRippleTags(booking?.tourImplementationId);

  const { executeMutationFn: deleteBooking, isMutating: isDeletingBooking } = useMutationFn(
    () => deleteBookingFn(bookingId),
    {
      invalidatesTags: deleteInvalidateTags,
    },
  );

  const handleUpdateBooking = useCallback(
    (updatedFields: UpdateBookingRequest, onSuccessCallback?: () => void) => {
      updateBooking(updatedFields, {
        onSuccess: () => {
          onSuccessCallback?.();
        },
        onError: (error: ApiError) => {
          Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra khi cập nhật.'));
        },
      });
    },
    [updateBooking],
  );

  const handleDelete = useCallback(
    (onStart?: () => void, onFinish?: () => void) => {
      if (!bookingId) return;
      Alert.alert('Xác nhận', 'Bạn muốn xoá?', [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'OK',
          style: 'destructive',
          onPress: () => {
            onStart?.();
            deleteBooking({
              onSuccess: () => {
                onFinish?.();
                router.back();
              },
              onError: (error: ApiError) => {
                onFinish?.();
                Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra khi xóa.'));
              },
            });
          },
        },
      ]);
    },
    [bookingId, deleteBooking, router],
  );

  if (!booking) {
    return null;
  }

  const canEdit = booking.meta?.canEdit ?? false;

  return (
    <BookingDetailContext
      value={{
        bookingId,
        booking,
        canEdit,
        isRefreshingBooking,
        isUpdatingBooking,
        isDeletingBooking,
        handleUpdateBooking,
        handleDelete,
        refreshBooking,
        signatures: signaturesData ?? [],
        isLoadingSignatures: isLoadingSignatures ?? false,
        fetchSignatures,
        refreshSignatures,
        signBooking,
        cancelBooking,
        isSigningBooking,
        isCancelingBooking,
      }}
    >
      <OrganizationAbilityProvider organizationId={booking.organizationId}>
        {children}
      </OrganizationAbilityProvider>
    </BookingDetailContext>
  );
}
