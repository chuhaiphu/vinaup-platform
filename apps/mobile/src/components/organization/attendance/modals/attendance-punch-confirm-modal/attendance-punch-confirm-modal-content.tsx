import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import {
  checkOutAttendanceRecordSchema,
  createAttendanceRecordSchema,
} from '@vinaup-platform/validation';
import { useImperativeHandle, useState } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';

import { ConfirmSlideSheetContentRef } from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { FlatTextInput } from '@/components/primitives/flat-text-input';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import {
  ATTENDANCE_PUNCH_ACTION,
  AttendanceMode,
  AttendancePunchAction,
} from '@/constants/attendance-constants';
import { COLORS, FONT_SIZES, ICON_SIZES, RADIUS, SPACING } from '@/constants/style-constants';
import { FieldErrors, FieldValidator, useValidatedFields } from '@/hooks/use-validated-fields';
import {
  CheckOutAttendanceRecordRequest,
  CreateAttendanceRecordRequest,
} from '@/interfaces/attendance-interfaces';

export type AttendancePunchFieldValues = {
  location: string;
  note: string;
};

// Discriminated so the caller narrows to the right request type instead of casting —
// check-in and check-out are separate endpoints with separate payloads.
export type AttendancePunchSubmitValue =
  | { punchAction: typeof ATTENDANCE_PUNCH_ACTION.CHECK_IN; request: CreateAttendanceRecordRequest }
  | {
      punchAction: typeof ATTENDANCE_PUNCH_ACTION.CHECK_OUT;
      request: CheckOutAttendanceRecordRequest;
    };

const DEFAULT_FIELD_VALUES: AttendancePunchFieldValues = {
  location: '',
  note: '',
};

interface AttendancePunchConfirmModalContentProps {
  organizationId: string;
  punchAction: AttendancePunchAction;
  /** Only read for a check-in — check-out closes whatever session the server has open. */
  attendanceMode: AttendanceMode;
  isLoading?: boolean;
  onSubmit?: (value: AttendancePunchSubmitValue) => void;
  ref?: React.RefObject<ConfirmSlideSheetContentRef | null>;
}

export function AttendancePunchConfirmModalContent({
  organizationId,
  punchAction,
  attendanceMode,
  isLoading = false,
  onSubmit,
  ref,
}: AttendancePunchConfirmModalContentProps) {
  const [isExtraInfoExpanded, setIsExtraInfoExpanded] = useState(false);

  const validate: FieldValidator<
    AttendancePunchFieldValues,
    keyof AttendancePunchFieldValues,
    AttendancePunchSubmitValue
  > = (values) => {
    // Both fields are nullish on the wire, so an untouched sheet submits as a bare punch.
    const location = values.location.trim() || null;
    const note = values.note.trim() || null;

    const submitValue: AttendancePunchSubmitValue =
      punchAction === ATTENDANCE_PUNCH_ACTION.CHECK_IN
        ? {
            punchAction: ATTENDANCE_PUNCH_ACTION.CHECK_IN,
            request: { organizationId, mode: attendanceMode, location, note },
          }
        : {
            punchAction: ATTENDANCE_PUNCH_ACTION.CHECK_OUT,
            request: { organizationId, location, note },
          };

    const result =
      submitValue.punchAction === ATTENDANCE_PUNCH_ACTION.CHECK_IN
        ? createAttendanceRecordSchema.safeParse(submitValue.request)
        : checkOutAttendanceRecordSchema.safeParse(submitValue.request);
    const fieldErrors: FieldErrors<keyof AttendancePunchFieldValues> = {};

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof AttendancePunchFieldValues;
        if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
      }
    }

    if (Object.keys(fieldErrors).length > 0) return { success: false, fieldErrors };
    return { success: true, data: submitValue };
  };

  const { fieldValues, fieldErrors, setFieldValue, validateAll } = useValidatedFields(
    DEFAULT_FIELD_VALUES,
    validate,
  );

  const handleConfirm = () => {
    Keyboard.dismiss();
    const submitValue = validateAll();
    // A field error only ever comes from an expanded field, so surface the section holding it.
    if (!submitValue) {
      setIsExtraInfoExpanded(true);
      return;
    }
    onSubmit?.(submitValue);
  };

  useImperativeHandle(ref, () => ({ submit: handleConfirm }));

  return (
    <View style={styles.container}>
      <PressableOpacity
        style={styles.titleContainer}
        onPress={() => setIsExtraInfoExpanded((isExpanded) => !isExpanded)}
        hitSlop={SPACING.sm}
      >
        <Text style={styles.titleText}>Thông tin thêm</Text>
        <FontAwesome5
          name={isExtraInfoExpanded ? 'caret-up' : 'caret-down'}
          iconStyle="solid"
          size={ICON_SIZES.md}
          color={COLORS.teal700}
        />
      </PressableOpacity>
      {isExtraInfoExpanded && (
        <View style={styles.fieldContainer}>
          <FlatTextInput
            label="Địa điểm"
            value={fieldValues.location}
            onChangeText={(value) => setFieldValue('location', value)}
            alignLabel="left"
            alignValue="left"
            error={fieldErrors.location}
            placeholder="..."
            editable={!isLoading}
          />
          <FlatTextInput
            label="Ghi chú"
            value={fieldValues.note}
            onChangeText={(value) => setFieldValue('note', value)}
            alignLabel="left"
            alignValue="left"
            error={fieldErrors.note}
            placeholder="..."
            editable={!isLoading}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  titleText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
  },
  fieldContainer: {
    borderWidth: 1,
    borderColor: COLORS.teal700,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
});
