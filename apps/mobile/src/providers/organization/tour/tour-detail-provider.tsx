import { useFetch, useMutationFn, type ApiError } from 'fetchwire';
import { createContext, useCallback, useContext } from 'react';
import { Alert } from 'react-native';

import { getTourById, updateTour as updateTourFn, deleteTour } from '@/apis/tour/tour-apis';
import { FETCH_TAG, getTourRippleTags } from '@/constants/fetch-tag-constants';
import { TourResponse, UpdateTourRequest } from '@/interfaces/tour-interfaces';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

interface TourDetailContextType {
  tourId: string;
  tour: TourResponse;
  isRefreshingTour: boolean;
  isUpdatingTour: boolean;
  handleUpdateTour: (fields: UpdateTourRequest, onSuccess?: () => void) => void;
  refreshTour: () => void;
  deleteTour: (callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void }) => void;
  isDeleting: boolean;
}

const TourDetailContext = createContext<TourDetailContextType | null>(null);

export function useTourDetailContext() {
  const ctx = useContext(TourDetailContext);
  if (!ctx) throw new Error('useTourDetailContext must be used within TourDetailProvider');
  return ctx;
}

export function TourDetailProvider({
  tourId,
  children,
}: {
  tourId: string;
  children: React.ReactNode;
}) {
  const {
    data: tour,
    isRefreshing: isRefreshingTour,
    refreshFetch: refreshTour,
  } = useFetch(() => getTourById(tourId), {
    fetchKey: `organization-tour-${tourId}`,
    tags: [FETCH_TAG.tourByTourId(tourId)],
  });

  const { executeMutationFn: updateTour, isMutating: isUpdatingTour } = useMutationFn(
    (updatedFields: UpdateTourRequest) => updateTourFn(tourId, updatedFields),
    { invalidatesTags: [...getTourRippleTags(), FETCH_TAG.tourByTourId(tourId)] },
  );

  const { executeMutationFn: execDeleteTour, isMutating: isDeleting } = useMutationFn(
    () => deleteTour(tourId),
    { invalidatesTags: getTourRippleTags() },
  );

  const handleUpdateTour = useCallback(
    (updatedFields: UpdateTourRequest, onSuccessCallback?: () => void) => {
      updateTour(updatedFields, {
        onSuccess: () => {
          onSuccessCallback?.();
        },
        onError: (error: ApiError) => {
          Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra khi cập nhật.'));
        },
      });
    },
    [updateTour],
  );

  if (!tour) {
    return null;
  }

  return (
    <TourDetailContext
      value={{
        tourId,
        tour,
        isRefreshingTour,
        isUpdatingTour,
        handleUpdateTour,
        refreshTour,
        deleteTour: (cb) => execDeleteTour(undefined, cb),
        isDeleting,
      }}
    >
      {children}
    </TourDetailContext>
  );
}
