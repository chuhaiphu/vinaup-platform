import { updateAttendanceConclusionSchema } from '@vinaup-platform/validation';
import { useImperativeHandle } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';

import VinaupCheckIn from '@/components/icons/vinaup-check-in.native';
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
import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ICON_SIZES,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';
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
  /** Who the verdict is about — absent only when the screen was reached without the member's name. */
  organizationMemberName?: string;
  attendanceConclusion: AttendanceConclusionResponse | null;
  totalText: string;
  isLoading?: boolean;
  onSubmit?: (value: AttendanceConclusionSubmitValue) => void;
  ref?: React.RefObject<ConfirmSlideSheetContentRef | null>;
}

export function AttendanceConclusionModalContent({
  organizationMemberName,
  attendanceConclusion,
  totalText,
  isLoading = false,
  onSubmit,
  ref,
}: AttendanceConclusionModalContentProps) {
  const defaultFieldValues: AttendanceConclusionFieldValues = {
    status: attendanceConclusion?.status ?? ATTENDANCE_CONCLUSION_STATUS.DRAFT,
    workdayUnit: attendanceConclusion?.workdayUnit ?? 0,
    authorizedLeaveDayUnit: attendanceConclusion?.authorizedLeaveDayUnit ?? 0,
    // No input of its own for now — carried through untouched so hiding the row cannot wipe a
    // value that is already on the record.
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

  const renderFieldLabel = (label: string) => (
    <Text style={styles.fieldLabelText} numberOfLines={1}>
      {label}
    </Text>
  );

  const renderFieldUnit = (unit: string) => (
    <Text style={[styles.fieldUnitText, isLoading && styles.fieldUnitDisabledText]}>{unit}</Text>
  );

  const renderDayUnitRow = (
    label: string,
    field: 'workdayUnit' | 'authorizedLeaveDayUnit' | 'unauthorizedLeaveDayUnit',
  ) => (
    <TextSwitcher
      options={ATTENDANCE_DAY_UNIT_OPTIONS}
      value={fieldValues[field]}
      onChange={(value) => setFieldValue(field, value)}
      disabled={isLoading}
      leftSection={renderFieldLabel(label)}
      rightSection={renderFieldUnit('ngày')}
      style={{ container: styles.fieldRow, text: styles.fieldValueText }}
    />
  );

  const renderNumericRow = (
    label: string,
    unit: string,
    value: string,
    onChangeText: (text: string) => void,
    error?: string,
  ) => (
    <OutlinedTextInput
      style={{ container: styles.fieldRow, input: styles.fieldValueText }}
      value={value}
      onChangeText={onChangeText}
      keyboardType="numeric"
      placeholder="0"
      isDisabled={isLoading}
      error={error}
      leftSection={renderFieldLabel(label)}
      rightSection={renderFieldUnit(unit)}
    />
  );

  return (
    <View style={styles.container}>
      {!!organizationMemberName && (
        <View style={styles.memberRow}>
          <VinaupCheckIn width={ICON_SIZES.md} height={ICON_SIZES.md} color={COLORS.yellow400} />
          <Text style={styles.memberNameText} numberOfLines={1} ellipsizeMode="tail">
            {organizationMemberName}
          </Text>
        </View>
      )}

      <View style={styles.statusRow}>
        <View style={styles.statusControlContainer}>
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
        </View>
        <Text style={styles.statusTotalText}>Tổng: {totalText}</Text>
      </View>

      {showCompletingWarning && (
        <Text style={styles.warningText}>
          Khi kết luận <Text style={styles.warningEmphasisText}>Hoàn thành</Text>, toàn bộ thành
          viên sẽ không thể chấm công hay cập nhật nội dung chấm công được nữa.
        </Text>
      )}

      <View style={styles.fieldContainer}>
        {renderDayUnitRow('Ngày công', 'workdayUnit')}
        {renderDayUnitRow('Nghỉ có phép', 'authorizedLeaveDayUnit')}
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
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  memberNameText: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  // Bounds the track so its two segments split an equal, known width instead of hugging their labels.
  statusControlContainer: {
    flex: 1,
  },
  statusTotalText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal900,
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
  warningEmphasisText: {
    fontWeight: FONT_WEIGHTS.bold,
  },
  fieldContainer: {
    gap: SPACING.sm,
  },
  fieldRow: {
    height: 40,
    borderColor: COLORS.gray300,
    backgroundColor: COLORS.gray50,
  },
  fieldLabelText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
  },
  // A floor under the value so the caret stays reachable once the label has taken the free space.
  fieldValueText: {
    minWidth: 32,
    textAlign: 'right',
    fontWeight: FONT_WEIGHTS.bold,
  },
  fieldUnitText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
  },
  fieldUnitDisabledText: {
    color: COLORS.gray300,
  },
});
