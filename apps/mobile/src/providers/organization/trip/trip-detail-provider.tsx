import { useRouter } from 'expo-router';
import { useFetch, useMutationFn, type ApiError } from 'fetchwire';
import { createContext, useCallback, useContext } from 'react';
import { Alert } from 'react-native';

import {
  deleteTrip as deleteTripFn,
  getTripById,
  updateTrip as updateTripFn,
} from '@/apis/trip/trip-apis';
import { FETCH_TAG, getTripRippleTags } from '@/constants/fetch-tag-constants';
import { TripResponse, UpdateTripRequest } from '@/interfaces/trip-interfaces';
import { OrganizationAbilityProvider } from '@/providers/organization/organization-ability-provider';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

interface TripDetailContextType {
  tripId: string;
  trip: TripResponse;
  isRefreshingTrip: boolean;
  isUpdatingTrip: boolean;
  isDeletingTrip: boolean;
  handleUpdateTrip: (fields: UpdateTripRequest, onSuccess?: () => void) => void;
  handleDelete: (onStart?: () => void, onFinish?: () => void) => void;
  refreshTrip: () => void;
}

const TripDetailContext = createContext<TripDetailContextType | null>(null);

export function useTripDetailContext() {
  const ctx = useContext(TripDetailContext);
  if (!ctx) throw new Error('useTripDetailContext must be used within TripDetailProvider');
  return ctx;
}

export function TripDetailProvider({
  tripId,
  children,
}: {
  tripId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const {
    data: trip,
    isRefreshing: isRefreshingTrip,
    refreshFetch: refreshTrip,
  } = useFetch(() => getTripById(tripId), {
    fetchKey: `organization-trip-${tripId}`,
    tags: [FETCH_TAG.tripByTripId(tripId)],
  });

  // Editing dates/status changes the overlap window that other trips' assignment conflicts are derived from,
  // so getTripRippleTags refreshes every trip's assignment list via its collection tag.
  const { executeMutationFn: updateTrip, isMutating: isUpdatingTrip } = useMutationFn(
    (updatedFields: UpdateTripRequest) => updateTripFn(tripId, updatedFields),
    { invalidatesTags: [...getTripRippleTags(), FETCH_TAG.tripByTripId(tripId)] },
  );

  // Deleting the trip cascade-frees its cars/drivers, so other trips' conflicts must refresh too.
  const { executeMutationFn: deleteTrip, isMutating: isDeletingTrip } = useMutationFn(
    () => deleteTripFn(tripId),
    { invalidatesTags: getTripRippleTags() },
  );

  const handleUpdateTrip = useCallback(
    (updatedFields: UpdateTripRequest, onSuccessCallback?: () => void) => {
      updateTrip(updatedFields, {
        onSuccess: () => {
          onSuccessCallback?.();
        },
        onError: (error: ApiError) => {
          Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra khi cập nhật.'));
        },
      });
    },
    [updateTrip],
  );

  const handleDelete = useCallback(
    (onStart?: () => void, onFinish?: () => void) => {
      if (!tripId) return;
      Alert.alert('Xác nhận', 'Bạn muốn xoá?', [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'OK',
          style: 'destructive',
          onPress: () => {
            onStart?.();
            deleteTrip({
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
    [tripId, deleteTrip, router],
  );

  if (!trip) {
    return null;
  }

  return (
    <TripDetailContext
      value={{
        tripId,
        trip,
        isRefreshingTrip,
        isUpdatingTrip,
        isDeletingTrip,
        handleUpdateTrip,
        handleDelete,
        refreshTrip,
      }}
    >
      <OrganizationAbilityProvider organizationId={trip.organizationId}>
        {children}
      </OrganizationAbilityProvider>
    </TripDetailContext>
  );
}
