import { useFetch, useMutationFn, type ApiError } from 'fetchwire';
import { createContext, useCallback, useContext } from 'react';
import { Alert } from 'react-native';

import {
  createAttendanceConclusion,
  getAttendanceConclusionsByOrganizationId,
  updateAttendanceConclusion,
} from '@/apis/attendance/attendance-conclusion-apis';
import { getAttendanceConclusionRippleTags, FETCH_TAG } from '@/constants/fetch-tag-constants';
import {
  AttendanceConclusionResponse,
  CreateAttendanceConclusionRequest,
  UpdateAttendanceConclusionRequest,
} from '@/interfaces/attendance-interfaces';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

interface OrganizationAttendanceConclusionListContextType {
  attendanceConclusions: AttendanceConclusionResponse[];
  isRefreshing: boolean;
  isMutatingAttendanceConclusion: boolean;
  refreshFetch: () => void;
  handleCreateAttendanceConclusion: (
    fields: CreateAttendanceConclusionRequest,
    onSuccess?: () => void,
  ) => void;
  handleUpdateAttendanceConclusion: (
    attendanceConclusionId: string,
    fields: UpdateAttendanceConclusionRequest,
    onSuccess?: () => void,
  ) => void;
  /** One verdict per (member, workDate): writes the member's first one, or revises the one on file. */
  handleSubmitAttendanceConclusion: (
    organizationMemberId: string,
    fields: UpdateAttendanceConclusionRequest,
    onSuccess?: () => void,
  ) => void;
}

const OrganizationAttendanceConclusionListContext =
  createContext<OrganizationAttendanceConclusionListContextType | null>(null);

export function useOrganizationAttendanceConclusionListContext() {
  const ctx = useContext(OrganizationAttendanceConclusionListContext);
  if (!ctx)
    throw new Error(
      'useOrganizationAttendanceConclusionListContext must be used within OrganizationAttendanceConclusionListProvider',
    );
  return ctx;
}

export function OrganizationAttendanceConclusionListProvider({
  organizationId,
  workDate,
  children,
}: {
  organizationId: string;
  workDate: string;
  children: React.ReactNode;
}) {
  // One bare YYYY-MM-DD on both bounds — the filter schema rejects a half-open range.
  const { data, refreshFetch, isRefreshing } = useFetch(
    () =>
      getAttendanceConclusionsByOrganizationId(organizationId, {
        workDateFrom: workDate,
        workDateTo: workDate,
      }),
    {
      fetchKey: `organization-attendance-conclusion-list-${organizationId}-${workDate}`,
      tags: [FETCH_TAG.attendanceConclusionList],
    },
  );

  const {
    executeMutationFn: createAttendanceConclusionFn,
    isMutating: isCreatingAttendanceConclusion,
  } = useMutationFn(
    (fields: CreateAttendanceConclusionRequest) => createAttendanceConclusion(fields),
    { invalidatesTags: getAttendanceConclusionRippleTags() },
  );

  const {
    executeMutationFn: updateAttendanceConclusionFn,
    isMutating: isUpdatingAttendanceConclusion,
  } = useMutationFn(
    ({
      attendanceConclusionId,
      fields,
    }: {
      attendanceConclusionId: string;
      fields: UpdateAttendanceConclusionRequest;
    }) => updateAttendanceConclusion(attendanceConclusionId, fields),
    { invalidatesTags: getAttendanceConclusionRippleTags() },
  );

  const handleCreateAttendanceConclusion = useCallback(
    (fields: CreateAttendanceConclusionRequest, onSuccessCallback?: () => void) => {
      createAttendanceConclusionFn(fields, {
        onSuccess: () => {
          onSuccessCallback?.();
        },
        onError: (error: ApiError) => {
          Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra khi chốt công.'));
        },
      });
    },
    [createAttendanceConclusionFn],
  );

  const handleUpdateAttendanceConclusion = useCallback(
    (
      attendanceConclusionId: string,
      fields: UpdateAttendanceConclusionRequest,
      onSuccessCallback?: () => void,
    ) => {
      updateAttendanceConclusionFn(
        { attendanceConclusionId, fields },
        {
          onSuccess: () => {
            onSuccessCallback?.();
          },
          onError: (error: ApiError) => {
            Alert.alert(
              'Lỗi',
              generateErrorMessage(error, 'Có lỗi xảy ra khi cập nhật chốt công.'),
            );
          },
        },
      );
    },
    [updateAttendanceConclusionFn],
  );

  const handleSubmitAttendanceConclusion = useCallback(
    (
      organizationMemberId: string,
      fields: UpdateAttendanceConclusionRequest,
      onSuccessCallback?: () => void,
    ) => {
      const existingAttendanceConclusion = (data ?? []).find(
        (attendanceConclusion) =>
          attendanceConclusion.organizationMemberId === organizationMemberId,
      );

      if (existingAttendanceConclusion) {
        handleUpdateAttendanceConclusion(
          existingAttendanceConclusion.id,
          fields,
          onSuccessCallback,
        );
        return;
      }

      handleCreateAttendanceConclusion(
        { organizationId, organizationMemberId, workDate, ...fields },
        onSuccessCallback,
      );
    },
    [
      data,
      organizationId,
      workDate,
      handleCreateAttendanceConclusion,
      handleUpdateAttendanceConclusion,
    ],
  );

  return (
    <OrganizationAttendanceConclusionListContext
      value={{
        attendanceConclusions: data ?? [],
        isRefreshing,
        isMutatingAttendanceConclusion:
          isCreatingAttendanceConclusion || isUpdatingAttendanceConclusion,
        refreshFetch,
        handleCreateAttendanceConclusion,
        handleUpdateAttendanceConclusion,
        handleSubmitAttendanceConclusion,
      }}
    >
      {children}
    </OrganizationAttendanceConclusionListContext>
  );
}
