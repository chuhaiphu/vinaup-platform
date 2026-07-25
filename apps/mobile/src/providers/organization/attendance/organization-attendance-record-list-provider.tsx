import { useFetch, useMutationFn, type ApiError } from 'fetchwire';
import { createContext, useCallback, useContext } from 'react';
import { Alert } from 'react-native';

import {
  checkOutAttendanceRecord,
  createAttendanceRecord,
  getMyAttendanceRecords,
} from '@/apis/attendance/attendance-record-apis';
import { ATTENDANCE_RECORD_STATUS } from '@/constants/attendance-constants';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import {
  AttendanceRecordResponse,
  CheckOutAttendanceRecordRequest,
  CreateAttendanceRecordRequest,
} from '@/interfaces/attendance-interfaces';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

interface OrganizationAttendanceRecordListContextType {
  attendanceRecords: AttendanceRecordResponse[];
  /** The caller's still-running session, whichever day it was opened on. */
  openAttendanceRecord?: AttendanceRecordResponse;
  isRefreshing: boolean;
  isCreatingAttendanceRecord: boolean;
  isCheckingOutAttendanceRecord: boolean;
  handleCreateAttendanceRecord: (
    fields: CreateAttendanceRecordRequest,
    onSuccess?: () => void,
  ) => void;
  handleCheckOutAttendanceRecord: (
    fields: CheckOutAttendanceRecordRequest,
    onSuccess?: () => void,
  ) => void;
  refreshFetch: () => void;
}

const OrganizationAttendanceRecordListContext =
  createContext<OrganizationAttendanceRecordListContextType | null>(null);

export function useOrganizationAttendanceRecordListContext() {
  const ctx = useContext(OrganizationAttendanceRecordListContext);
  if (!ctx)
    throw new Error(
      'useOrganizationAttendanceRecordListContext must be used within OrganizationAttendanceRecordListProvider',
    );
  return ctx;
}

export function OrganizationAttendanceRecordListProvider({
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
    () => getMyAttendanceRecords({ organizationId, workDateFrom: workDate, workDateTo: workDate }),
    {
      fetchKey: `organization-attendance-record-list-${organizationId}-${workDate}`,
      tags: [FETCH_TAG.attendanceRecordList],
    },
  );

  // Deliberately NOT bounded by workDate, and keyed without it: the server keeps at most one OPEN
  // record per org member across all days, and an overnight session keeps the workDate it was
  // opened on — so the day in view would hide it, leaving no way to ever check out.
  const { data: openAttendanceRecordList } = useFetch(
    () => getMyAttendanceRecords({ organizationId, status: ATTENDANCE_RECORD_STATUS.OPEN }),
    {
      fetchKey: `organization-attendance-open-record-${organizationId}`,
      tags: [FETCH_TAG.attendanceRecordList],
    },
  );

  const { executeMutationFn: createAttendanceRecordFn, isMutating: isCreatingAttendanceRecord } =
    useMutationFn((fields: CreateAttendanceRecordRequest) => createAttendanceRecord(fields), {
      invalidatesTags: [FETCH_TAG.attendanceRecordList],
    });

  const {
    executeMutationFn: checkOutAttendanceRecordFn,
    isMutating: isCheckingOutAttendanceRecord,
  } = useMutationFn((fields: CheckOutAttendanceRecordRequest) => checkOutAttendanceRecord(fields), {
    invalidatesTags: [FETCH_TAG.attendanceRecordList],
  });

  const handleCreateAttendanceRecord = useCallback(
    (fields: CreateAttendanceRecordRequest, onSuccessCallback?: () => void) => {
      createAttendanceRecordFn(fields, {
        onSuccess: () => {
          onSuccessCallback?.();
        },
        onError: (error: ApiError) => {
          Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra khi chấm công.'));
        },
      });
    },
    [createAttendanceRecordFn],
  );

  const handleCheckOutAttendanceRecord = useCallback(
    (fields: CheckOutAttendanceRecordRequest, onSuccessCallback?: () => void) => {
      checkOutAttendanceRecordFn(fields, {
        onSuccess: () => {
          onSuccessCallback?.();
        },
        onError: (error: ApiError) => {
          Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra khi check out.'));
        },
      });
    },
    [checkOutAttendanceRecordFn],
  );

  return (
    <OrganizationAttendanceRecordListContext
      value={{
        attendanceRecords: data ?? [],
        openAttendanceRecord: openAttendanceRecordList?.[0],
        isRefreshing,
        isCreatingAttendanceRecord,
        isCheckingOutAttendanceRecord,
        handleCreateAttendanceRecord,
        handleCheckOutAttendanceRecord,
        refreshFetch,
      }}
    >
      {children}
    </OrganizationAttendanceRecordListContext>
  );
}
