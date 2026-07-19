import { useFetch, useMutationFn, type ApiError } from 'fetchwire';
import { createContext, useCallback, useContext } from 'react';
import { Alert } from 'react-native';

import {
  createTripAssignment as createTripAssignmentFn,
  deleteTripAssignment as deleteTripAssignmentFn,
  getTripAssignmentsByTripId,
  updateTripAssignment as updateTripAssignmentFn,
} from '@/apis/trip/trip-assignment-apis';
import { FETCH_TAG, getTripAssignmentRippleTags } from '@/constants/fetch-tag-constants';
import { TripAssignmentWithMeta, UpdateTripAssignmentRequest } from '@/interfaces/trip-interfaces';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

interface TripAssignmentListContextType {
  tripAssignments: TripAssignmentWithMeta[];
  isRefreshing: boolean;
  isCreatingTripAssignment: boolean;
  isUpdatingTripAssignment: boolean;
  isDeletingTripAssignment: boolean;
  handleCreateTripAssignment: (onSuccess?: () => void) => void;
  handleUpdateTripAssignment: (
    id: string,
    fields: UpdateTripAssignmentRequest,
    onSuccess?: () => void,
  ) => void;
  handleDeleteTripAssignment: (id: string, onSuccess?: () => void) => void;
  refreshFetch: () => void;
}

const TripAssignmentListContext = createContext<TripAssignmentListContextType | null>(null);

export function useTripAssignmentListContext() {
  const ctx = useContext(TripAssignmentListContext);
  if (!ctx)
    throw new Error('useTripAssignmentListContext must be used within TripAssignmentListProvider');
  return ctx;
}

export function TripAssignmentListProvider({
  tripId,
  children,
}: {
  tripId: string;
  children: React.ReactNode;
}) {
  const fetchKey = `organization-trip-assignment-list-${tripId}`;

  const {
    data: tripAssignments,
    refreshFetch,
    isRefreshing,
  } = useFetch(() => getTripAssignmentsByTripId(tripId), {
    fetchKey,
    tags: [fetchKey, FETCH_TAG.tripAssignmentList],
  });

  const { executeMutationFn: createTripAssignment, isMutating: isCreatingTripAssignment } =
    useMutationFn(() => createTripAssignmentFn({ tripId }), {
      invalidatesTags: getTripAssignmentRippleTags(),
    });

  const { executeMutationFn: updateTripAssignment, isMutating: isUpdatingTripAssignment } =
    useMutationFn(
      ({ id, fields }: { id: string; fields: UpdateTripAssignmentRequest }) =>
        updateTripAssignmentFn(id, fields),
      { invalidatesTags: getTripAssignmentRippleTags() },
    );

  const { executeMutationFn: deleteTripAssignment, isMutating: isDeletingTripAssignment } =
    useMutationFn((id: string) => deleteTripAssignmentFn(id), {
      invalidatesTags: getTripAssignmentRippleTags(),
    });

  const handleCreateTripAssignment = useCallback(
    (onSuccessCallback?: () => void) => {
      createTripAssignment({
        onSuccess: () => onSuccessCallback?.(),
        onError: (error: ApiError) =>
          Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra khi tạo phân công.')),
      });
    },
    [createTripAssignment],
  );

  const handleUpdateTripAssignment = useCallback(
    (id: string, fields: UpdateTripAssignmentRequest, onSuccessCallback?: () => void) => {
      updateTripAssignment(
        { id, fields },
        {
          onSuccess: () => onSuccessCallback?.(),
          onError: (error: ApiError) =>
            Alert.alert(
              'Lỗi',
              generateErrorMessage(error, 'Có lỗi xảy ra khi cập nhật phân công.'),
            ),
        },
      );
    },
    [updateTripAssignment],
  );

  const handleDeleteTripAssignment = useCallback(
    (id: string, onSuccessCallback?: () => void) => {
      deleteTripAssignment(id, {
        onSuccess: () => onSuccessCallback?.(),
        onError: (error: ApiError) =>
          Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra khi xoá phân công.')),
      });
    },
    [deleteTripAssignment],
  );

  return (
    <TripAssignmentListContext
      value={{
        tripAssignments: tripAssignments ?? [],
        isRefreshing,
        isCreatingTripAssignment,
        isUpdatingTripAssignment,
        isDeletingTripAssignment,
        handleCreateTripAssignment,
        handleUpdateTripAssignment,
        handleDeleteTripAssignment,
        refreshFetch,
      }}
    >
      {children}
    </TripAssignmentListContext>
  );
}
