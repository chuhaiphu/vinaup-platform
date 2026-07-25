import { useFetch, useMutationFn, type ApiError } from 'fetchwire';
import { createContext, useCallback, useContext, useState } from 'react';
import { Alert } from 'react-native';

import {
  checkOutAttendanceRecord,
  createAttendanceRecord,
  getMyAttendanceRecords,
} from '@/apis/attendance/attendance-record-apis';
import {
  ATTENDANCE_MODE,
  ATTENDANCE_RECORD_STATUS,
  type AttendanceMode,
} from '@/constants/attendance-constants';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import {
  AttendanceRecordResponse,
  CheckOutAttendanceRecordRequest,
  CreateAttendanceRecordRequest,
} from '@/interfaces/attendance-interfaces';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

interface OrganizationAttendancePunchContextType {
  /** The mode the next check-in will use — meaningless while a session is open. */
  attendanceMode: AttendanceMode;
  /** The caller's still-running session, whichever day it was opened on. */
  openAttendanceRecord?: AttendanceRecordResponse;
  isMutatingAttendanceRecord: boolean;
  /** Stays true past the mutation until the open session is re-read, because only then is the next punch action settled. */
  isPunchPending: boolean;
  handleToggleAttendanceMode: () => void;
  handleCreateAttendanceRecord: (
    fields: CreateAttendanceRecordRequest,
    onSuccess?: () => void,
  ) => void;
  handleCheckOutAttendanceRecord: (
    fields: CheckOutAttendanceRecordRequest,
    onSuccess?: () => void,
  ) => void;
}

const OrganizationAttendancePunchContext =
  createContext<OrganizationAttendancePunchContextType | null>(null);

export function useOrganizationAttendancePunchContext() {
  const ctx = useContext(OrganizationAttendancePunchContext);
  if (!ctx)
    throw new Error(
      'useOrganizationAttendancePunchContext must be used within OrganizationAttendancePunchProvider',
    );
  return ctx;
}

// Punching is day-independent: the open session and both mutations outlive the day in view,
// so they sit above the day-scoped record list instead of remounting with it.
export function OrganizationAttendancePunchProvider({
  organizationId,
  children,
}: {
  organizationId: string;
  children: React.ReactNode;
}) {
  const [attendanceMode, setAttendanceMode] = useState<AttendanceMode>(ATTENDANCE_MODE.CHECK_IN);

  // Deliberately NOT bounded by workDate: the server keeps at most one OPEN record per org member
  // across all days, and an overnight session keeps the workDate it was opened on — so the day in
  // view would hide it, leaving no way to ever check out.
  const { data: openAttendanceRecordList, isRefreshing: isRefreshingOpenAttendanceRecord } =
    useFetch(
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

  const isMutatingAttendanceRecord = isCreatingAttendanceRecord || isCheckingOutAttendanceRecord;
  const isPunchPending = isMutatingAttendanceRecord || isRefreshingOpenAttendanceRecord;

  const handleToggleAttendanceMode = useCallback(() => {
    setAttendanceMode((mode) =>
      mode === ATTENDANCE_MODE.CHECK_IN ? ATTENDANCE_MODE.CHECK_IN_OUT : ATTENDANCE_MODE.CHECK_IN,
    );
  }, []);

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
    <OrganizationAttendancePunchContext
      value={{
        attendanceMode,
        openAttendanceRecord: openAttendanceRecordList?.[0],
        isMutatingAttendanceRecord,
        isPunchPending,
        handleToggleAttendanceMode,
        handleCreateAttendanceRecord,
        handleCheckOutAttendanceRecord,
      }}
    >
      {children}
    </OrganizationAttendancePunchContext>
  );
}
