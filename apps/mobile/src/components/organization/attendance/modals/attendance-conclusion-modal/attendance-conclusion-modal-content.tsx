import { updateAttendanceConclusionSchema } from '@vinaup-platform/validation';
import { useImperativeHandle } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';

import { ConfirmSlideSheetContentRef } from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { FlatTextInput } from '@/components/primitives/flat-text-input';
import { OutlinedTextInput } from '@/components/primitives/outlined-text-input';
import { SegmentedControl, SegmentedControlItem } from '@/components/primitives/segmented-control';
import { TextSwitcher } from '@/components/primitives/text-switcher';
import {
  ATTENDANCE_CONCLUSION_STATUS,
  ATTENDANCE_DAY_UNIT_OPTIONS,
  AttendanceConclusionStatus,
  AttendanceConclusionStatusDisplay,
} from '@/constants/attendance-constants';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '@/constants/style-constants';
import { useFormatDecimalInput } from '@/hooks/use-format-decimal-input';
import { useFormatIntegerInput } from '@/hooks/use-format-integer-input';
import { FieldErrors, FieldValidator, useValidatedFields } from '@/hooks/use-validated-fields';
import {
  AttendanceConclusionResponse,
  UpdateAttendanceConclusionRequest,
} from '@/interfaces/attendance-interfaces';

export type AttendanceConclusionSubmitValue = UpdateAttendanceConclusionRequest;

type AttendanceConclusionFieldValues = {
  status: AttendanceConclusionStatus;
  workdayUnit: number;
  authorizedLeaveDayUnit: number;
  unauthorizedLeaveDayUnit: number;
  seasonalHours: string;
  overtimeHours: string;
  lateArrivalCount: string;
  earlyDepartureCount: string;
  note: string;
};

const STATUS_ITEMS: SegmentedControlItem<AttendanceConclusionStatus>[] = [
  {
    value: ATTENDANCE_CONCLUSION_STATUS.DRAFT,
    label: AttendanceConclusionStatusDisplay[ATTENDANCE_CONCLUSION_STATUS.DRAFT],
  },
  {
    value: ATTENDANCE_CONCLUSION_STATUS.COMPLETED,
    label: AttendanceConclusionStatusDisplay[ATTENDANCE_CONCLUSION_STATUS.COMPLETED],
  },
];

// A stored 0 renders as an empty field so the placeholder shows, matching every other numeric form.
const generateNumericFieldValue = (value: number): string => (value ? String(value) : '');

interface AttendanceConclusionModalContentProps {
  attendanceConclusion: AttendanceConclusionResponse | null;
  isLoading?: boolean;
  onSubmit?: (value: AttendanceConclusionSubmitValue) => void;
  ref?: React.RefObject<ConfirmSlideSheetContentRef | null>;
}

export function AttendanceConclusionModalContent({
  attendanceConclusion,
  isLoading = false,
  onSubmit,
  ref,
}: AttendanceConclusionModalContentProps) {
  const defaultFieldValues: AttendanceConclusionFieldValues = {
    status: attendanceConclusion?.status ?? ATTENDANCE_CONCLUSION_STATUS.DRAFT,
    workdayUnit: attendanceConclusion?.workdayUnit ?? 0,
    authorizedLeaveDayUnit: attendanceConclusion?.authorizedLeaveDayUnit ?? 0,
    unauthorizedLeaveDayUnit: attendanceConclusion?.unauthorizedLeaveDayUnit ?? 0,
    seasonalHours: generateNumericFieldValue(attendanceConclusion?.seasonalHours ?? 0),
    overtimeHours: generateNumericFieldValue(attendanceConclusion?.overtimeHours ?? 0),
    lateArrivalCount: generateNumericFieldValue(attendanceConclusion?.lateArrivalCount ?? 0),
    earlyDepartureCount: generateNumericFieldValue(attendanceConclusion?.earlyDepartureCount ?? 0),
    note: attendanceConclusion?.note ?? '',
  };

  const validate: FieldValidator<
    AttendanceConclusionFieldValues,
    keyof AttendanceConclusionFieldValues,
    AttendanceConclusionSubmitValue
  > = (values) => {
    const request: AttendanceConclusionSubmitValue = {
      status: values.status,
      workdayUnit: values.workdayUnit,
      authorizedLeaveDayUnit: values.authorizedLeaveDayUnit,
      unauthorizedLeaveDayUnit: values.unauthorizedLeaveDayUnit,
      seasonalHours: Number(values.seasonalHours) || 0,
      overtimeHours: Number(values.overtimeHours) || 0,
      lateArrivalCount: Number(values.lateArrivalCount) || 0,
      earlyDepartureCount: Number(values.earlyDepartureCount) || 0,
      // Emptied -> null clears the column; undefined would read as "leave unchanged".
      note: values.note.trim() || null,
    };

    const result = updateAttendanceConclusionSchema.safeParse(request);
    const fieldErrors: FieldErrors<keyof AttendanceConclusionFieldValues> = {};

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof AttendanceConclusionFieldValues;
        if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
      }
    }

    if (Object.keys(fieldErrors).length > 0) return { success: false, fieldErrors };
    return { success: true, data: request };
  };

  const { fieldValues, fieldErrors, setFieldValue, validateAll } = useValidatedFields(
    defaultFieldValues,
    validate,
  );

  const { displayValue: seasonalHoursDisplay, onDisplayValueChange: onSeasonalHoursChange } =
    useFormatDecimalInput(fieldValues.seasonalHours, (value) =>
      setFieldValue('seasonalHours', value),
    );
  const { displayValue: overtimeHoursDisplay, onDisplayValueChange: onOvertimeHoursChange } =
    useFormatDecimalInput(fieldValues.overtimeHours, (value) =>
      setFieldValue('overtimeHours', value),
    );
  const { displayValue: lateArrivalCountDisplay, onDisplayValueChange: onLateArrivalCountChange } =
    useFormatIntegerInput(fieldValues.lateArrivalCount, (value) =>
      setFieldValue('lateArrivalCount', value),
    );
  const {
    displayValue: earlyDepartureCountDisplay,
    onDisplayValueChange: onEarlyDepartureCountChange,
  } = useFormatIntegerInput(fieldValues.earlyDepartureCount, (value) =>
    setFieldValue('earlyDepartureCount', value),
  );

  // Completing closes the day's open records and drops their check-out time for good, so it is
  // announced before the press rather than discovered after it.
  const showCompletingWarning =
    attendanceConclusion?.status !== ATTENDANCE_CONCLUSION_STATUS.COMPLETED &&
    fieldValues.status === ATTENDANCE_CONCLUSION_STATUS.COMPLETED;

  const handleConfirm = () => {
    Keyboard.dismiss();

    const submitValue = validateAll();
    if (submitValue) onSubmit?.(submitValue);
  };

  useImperativeHandle(ref, () => ({ submit: handleConfirm }));

  const renderDayUnitRow = (
    label: string,
    field: 'workdayUnit' | 'authorizedLeaveDayUnit' | 'unauthorizedLeaveDayUnit',
  ) => (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabelText}>{label}</Text>
      <View style={styles.dayUnitContainer}>
        <TextSwitcher
          options={ATTENDANCE_DAY_UNIT_OPTIONS}
          value={fieldValues[field]}
          onChange={(value) => setFieldValue(field, value)}
          disabled={isLoading}
          style={{ container: styles.dayUnitSwitcher, text: styles.dayUnitSwitcherText }}
        />
      </View>
    </View>
  );

  const renderNumericRow = (
    label: string,
    unit: string,
    value: string,
    onChangeText: (text: string) => void,
    error?: string,
  ) => (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabelText}>{label}</Text>
      <View style={styles.numericContainer}>
        <OutlinedTextInput
          style={{ container: styles.numericInputContainer, input: styles.numericInput }}
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          placeholder="0"
          isDisabled={isLoading}
          error={error}
          rightSection={
            <Text style={[styles.unitText, isLoading && styles.unitDisabledText]}>{unit}</Text>
          }
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SegmentedControl
        items={STATUS_ITEMS}
        value={fieldValues.status}
        onChange={(value) => setFieldValue('status', value)}
        style={{
          track: styles.statusTrack,
          pill: styles.statusPill,
          activeLabel: styles.statusActiveLabel,
        }}
      />

      {showCompletingWarning && (
        <Text style={styles.warningText}>
          Khi hoàn thành: ngày công của thành viên bị khoá (không thể chấm công, sửa hoặc xoá lượt
          nào nữa), và lượt đang mở sẽ bị đóng lại kèm mất giờ check out.
        </Text>
      )}

      <View style={styles.fieldContainer}>
        {renderDayUnitRow('Ngày công', 'workdayUnit')}
        {renderDayUnitRow('Nghỉ có phép', 'authorizedLeaveDayUnit')}
        {renderDayUnitRow('Nghỉ không phép', 'unauthorizedLeaveDayUnit')}
      </View>

      <View style={styles.fieldContainer}>
        {renderNumericRow(
          'Giờ công thời vụ',
          'h',
          seasonalHoursDisplay,
          onSeasonalHoursChange,
          fieldErrors.seasonalHours,
        )}
        {renderNumericRow(
          'Giờ tăng ca',
          'h',
          overtimeHoursDisplay,
          onOvertimeHoursChange,
          fieldErrors.overtimeHours,
        )}
        {renderNumericRow(
          'Đi trễ',
          'lần',
          lateArrivalCountDisplay,
          onLateArrivalCountChange,
          fieldErrors.lateArrivalCount,
        )}
        {renderNumericRow(
          'Về sớm',
          'lần',
          earlyDepartureCountDisplay,
          onEarlyDepartureCountChange,
          fieldErrors.earlyDepartureCount,
        )}
      </View>

      <FlatTextInput
        multiline={true}
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
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.md,
  },
  statusTrack: {
    borderWidth: 1,
    borderColor: COLORS.teal700,
    borderRadius: RADIUS.md,
    padding: 2,
    backgroundColor: COLORS.white,
  },
  statusPill: {
    backgroundColor: COLORS.yellow300,
  },
  statusActiveLabel: {
    color: COLORS.teal700,
  },
  warningText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.orange700,
  },
  fieldContainer: {
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.teal700,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  fieldLabelText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
  },
  // Fixed share of the row so every switcher and input lines up down the column.
  dayUnitContainer: {
    width: 150,
  },
  // Matched to the numeric inputs below so both halves of the column read as one control set.
  dayUnitSwitcher: {
    height: 30,
    paddingVertical: 0,
  },
  dayUnitSwitcherText: {
    fontSize: FONT_SIZES.sm,
  },
  numericContainer: {
    width: 150,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  numericInputContainer: {
    flex: 1,
    paddingHorizontal: SPACING.xs,
    backgroundColor: COLORS.white,
  },
  numericInput: {
    flex: 1,
    height: 28,
    fontSize: FONT_SIZES.sm,
  },
  unitText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
  },
  unitDisabledText: {
    color: COLORS.gray300,
  },
});
