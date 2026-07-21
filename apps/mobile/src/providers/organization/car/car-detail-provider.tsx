import { useRouter } from 'expo-router';
import { useFetch, useFetchFn, useMutationFn, type ApiError, type HttpResponse } from 'fetchwire';
import { createContext, useContext } from 'react';
import { Alert } from 'react-native';

import {
  createCarAssignment as createCarAssignmentFn,
  deleteCarById,
  getCarAssignmentHistoryByCarId,
  getCarById,
  updateCar as updateCarFn,
} from '@/apis/car/car-apis';
import { getCarRippleTags, FETCH_TAG } from '@/constants/fetch-tag-constants';
import {
  CarAssignmentEventResponse,
  CarResponse,
  UpdateCarRequest,
} from '@/interfaces/car-interfaces';
import { OrganizationAbilityProvider } from '@/providers/organization/organization-ability-provider';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

interface CarDetailContextType {
  carId: string;
  car: CarResponse;
  isRefreshingCar: boolean;
  isUpdatingCar: boolean;
  isDeletingCar: boolean;
  handleUpdateCar: (
    fields: UpdateCarRequest,
    onSuccess?: () => void,
  ) => Promise<HttpResponse<CarResponse> | null>;
  handleDelete: (onStart?: () => void, onFinish?: () => void) => void;
  isAssigningMembers: boolean;
  handleAssignMembers: (organizationMemberIds: string[], onSuccess?: () => void) => void;
  refreshCar: () => void;
  assignmentHistory: CarAssignmentEventResponse[] | null;
  isLoadingAssignmentHistory: boolean;
  fetchAssignmentHistory: () => void;
}

const CarDetailContext = createContext<CarDetailContextType | null>(null);

export function useCarDetailContext() {
  const ctx = useContext(CarDetailContext);
  if (!ctx) throw new Error('useCarDetailContext must be used within CarDetailProvider');
  return ctx;
}

export function CarDetailProvider({
  carId,
  children,
}: {
  carId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const {
    data: car,
    isRefreshing: isRefreshingCar,
    refreshFetch: refreshCar,
  } = useFetch(() => getCarById(carId), {
    fetchKey: `organization-car-${carId}`,
    // Also subscribe to the car collection tag so a change to this car's server-derived
    // operational status (e.g. a trip assignment elsewhere) refreshes the open detail.
    tags: [FETCH_TAG.carByCarId(carId), FETCH_TAG.carList],
  });

  const { executeMutationFn: updateCar, isMutating: isUpdatingCar } = useMutationFn(
    (updatedFields: UpdateCarRequest) => updateCarFn(carId, updatedFields),
    { invalidatesTags: [...getCarRippleTags(), FETCH_TAG.carByCarId(carId)] },
  );

  const { executeMutationFn: deleteCar, isMutating: isDeletingCar } = useMutationFn(
    () => deleteCarById(carId),
    { invalidatesTags: getCarRippleTags() },
  );

  // ─── History is lazy: only fetched when the modal asks for it ─────────────────
  // It subscribes to its own tag so the assign mutation below can invalidate it.
  const {
    data: assignmentHistory,
    executeFetchFn: fetchAssignmentHistory,
    isLoading: isLoadingAssignmentHistory,
  } = useFetchFn(() => getCarAssignmentHistoryByCarId(carId), {
    fetchKey: `car-assignment-history-${carId}`,
    tags: [FETCH_TAG.carAssignmentHistoryByCarId(carId)],
  });

  // Assigning drivers restales this car's detail, its history, AND the car list — whose
  // cards embed each car's current driver names (car.carAssignments). Emit all three so
  // fetchwire auto-refreshes any active subscriber.
  const { executeMutationFn: assignMembers, isMutating: isAssigningMembers } = useMutationFn(
    (organizationMemberIds: string[]) => createCarAssignmentFn({ carId, organizationMemberIds }),
    {
      invalidatesTags: [
        FETCH_TAG.carByCarId(carId),
        FETCH_TAG.carList,
        FETCH_TAG.carAssignmentHistoryByCarId(carId),
      ],
    },
  );

  const handleUpdateCar = (updatedFields: UpdateCarRequest, onSuccessCallback?: () => void) =>
    updateCar(updatedFields, {
      onSuccess: () => {
        onSuccessCallback?.();
      },
      onError: (error: ApiError) => {
        Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra khi cập nhật.'));
      },
    });

  const handleAssignMembers = (organizationMemberIds: string[], onSuccessCallback?: () => void) => {
    assignMembers(organizationMemberIds, {
      onSuccess: () => {
        onSuccessCallback?.();
      },
      onError: (error: ApiError) => {
        Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra khi ghép tài xế.'));
      },
    });
  };

  const handleDelete = (onStart?: () => void, onFinish?: () => void) => {
    if (!carId) return;
    Alert.alert('Xác nhận', 'Bạn muốn xoá?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'OK',
        style: 'destructive',
        onPress: () => {
          onStart?.();
          deleteCar({
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
  };

  if (!car) {
    return null;
  }

  return (
    <CarDetailContext
      value={{
        carId,
        car,
        isRefreshingCar,
        isUpdatingCar,
        isDeletingCar,
        handleUpdateCar,
        handleDelete,
        isAssigningMembers,
        handleAssignMembers,
        refreshCar,
        assignmentHistory,
        isLoadingAssignmentHistory: isLoadingAssignmentHistory ?? false,
        fetchAssignmentHistory,
      }}
    >
      <OrganizationAbilityProvider organizationId={car.organizationId}>
        {children}
      </OrganizationAbilityProvider>
    </CarDetailContext>
  );
}
