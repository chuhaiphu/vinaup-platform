import { updateProjectSchema } from '@vinaup-platform/validation';
import dayjs, { Dayjs } from 'dayjs';
import { useImperativeHandle, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import VinaupLeftRightArrows from '@/components/icons/vinaup-left-right-arrows.native';
import { ConfirmSlideSheetContentRef } from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { DateTimePicker } from '@/components/primitives/date-time-picker';
import { FlatTextInput } from '@/components/primitives/flat-text-input';
import { TextToggler } from '@/components/primitives/text-toggler';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '@/constants/style-constants';

interface ProjectInfoModalContentProps {
  prjDescription?: string;
  prjCode?: string;
  prjStartDate?: string;
  prjEndDate?: string;
  prjNote?: string | null;
  isLoading?: boolean;
  onSubmit?: (data: {
    description: string;
    startDate: string;
    endDate: string;
    // Nullable, not just optional: an emptied input must clear the column, which needs an explicit null.
    code?: string | null;
    note?: string | null;
  }) => void;
  ref?: React.RefObject<ConfirmSlideSheetContentRef | null>;
}

export function ProjectInfoModalContent({
  prjDescription = '',
  prjCode,
  prjStartDate,
  prjEndDate,
  prjNote = '',
  isLoading = false,
  onSubmit,
  ref,
}: ProjectInfoModalContentProps) {
  const [description, setDescription] = useState(prjDescription);
  const [code, setCode] = useState(prjCode ?? '');
  const [startDate, setStartDate] = useState<Dayjs>(dayjs(prjStartDate));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs(prjEndDate));
  const [note, setNote] = useState(prjNote ?? '');
  const [inputErrors, setInputErrors] = useState<{
    description?: string;
  }>({});

  const isSameDay = startDate.isSame(endDate, 'day');
  const dateRangeType = isSameDay ? 'day' : 'period';

  // Field rules come from the shared schema, so the message matches what the API returns.
  const getDescriptionError = (value: string): string | undefined => {
    const result = updateProjectSchema.safeParse({ description: value });
    if (result.success) return undefined;
    return result.error.issues.find((issue) => issue.path[0] === 'description')?.message;
  };

  const handleConfirm = () => {
    const descriptionError = getDescriptionError(description);
    setInputErrors({ description: descriptionError });
    if (descriptionError) return;

    onSubmit?.({
      description,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      code: code.trim() || null,
      note: note.trim() || null,
    });
  };

  useImperativeHandle(ref, () => ({ submit: handleConfirm }));

  return (
    <View>
      <FlatTextInput
        label="Tiêu đề"
        value={description}
        onChangeText={(value) => {
          setDescription(value);
          setInputErrors((prev) => ({
            ...prev,
            description: getDescriptionError(value),
          }));
        }}
        alignLabel="left"
        alignValue="left"
        error={inputErrors.description}
        placeholder="..."
        maxLength={40}
        editable={!isLoading}
      />
      {!!inputErrors.description && (
        <Text style={styles.fieldErrorText}>{inputErrors.description}</Text>
      )}

      <FlatTextInput
        label="Mã số"
        value={code}
        onChangeText={setCode}
        alignLabel="left"
        alignValue="left"
        placeholder="..."
        maxLength={40}
        editable={!isLoading}
      />

      <FlatTextInput
        label="Ghi chú"
        value={note}
        onChangeText={setNote}
        alignLabel="left"
        alignValue="left"
        placeholder="..."
        editable={!isLoading}
      />

      <View style={styles.inputGroup}>
        <View style={styles.dateRangeRow}>
          <Text style={styles.inputLabel}>Thời gian: </Text>
          <TextToggler
            textPair={['Trong ngày', 'Giai đoạn']}
            iconPosition="right"
            iconPair={[
              <VinaupLeftRightArrows
                key={'left-right-arrows-muted'}
                leftArrowColor={COLORS.gray300}
              />,
              <VinaupLeftRightArrows key={'left-right-arrows'} />,
            ]}
            currentIndex={dateRangeType === 'day' ? 0 : 1}
            onToggle={() => {
              const nextType = dateRangeType === 'day' ? 'period' : 'day';
              if (nextType === 'day') {
                setEndDate(startDate.hour(23).minute(59));
              } else {
                setEndDate(startDate.add(1, 'day').hour(23).minute(59));
              }
            }}
          />
        </View>
      </View>

      <View style={styles.dateInputGroupContainer}>
        <View style={[styles.inputGroup, styles.dateInputGroup]}>
          <Text style={styles.inputLabel}>Bắt đầu</Text>
          <View style={styles.dateTimeRow}>
            <DateTimePicker
              style={{ dateText: styles.dateText }}
              mode="date"
              value={startDate}
              onChange={(d) => {
                const updated = startDate.year(d.year()).month(d.month()).date(d.date());
                setStartDate(updated);
                if (dateRangeType === 'day') {
                  setEndDate(updated.hour(23).minute(59));
                }
              }}
              displayFormat="DD/MM/YYYY"
              disabled={isLoading}
            />
            <DateTimePicker
              style={{ dateText: styles.dateText }}
              mode="time"
              value={startDate}
              onChange={(d) => {
                const updated = startDate.hour(d.hour()).minute(d.minute());
                setStartDate(updated);
                if (isSameDay) {
                  setEndDate(updated.hour(23).minute(59));
                }
              }}
              displayFormat="HH:mm"
              disabled={isLoading}
            />
          </View>
        </View>
        <View style={styles.divider} />

        {dateRangeType === 'period' && (
          <View style={[styles.inputGroup, styles.dateInputGroup]}>
            <Text style={styles.inputLabel}>Kết thúc</Text>
            <View style={styles.dateTimeRow}>
              <DateTimePicker
                style={{ dateText: styles.dateText }}
                mode="date"
                value={endDate}
                onChange={(d) => {
                  setEndDate(endDate.year(d.year()).month(d.month()).date(d.date()));
                }}
                displayFormat="DD/MM/YYYY"
                disabled={isLoading}
              />
              <DateTimePicker
                style={{ dateText: styles.dateText }}
                mode="time"
                value={endDate}
                onChange={(d) => {
                  setEndDate(endDate.hour(d.hour()).minute(d.minute()));
                }}
                displayFormat="HH:mm"
                disabled={isLoading}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldErrorText: {
    color: COLORS.red600,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.sm,
  },
  inputGroup: {
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  inputLabel: {
    fontSize: FONT_SIZES.base,
  },
  dateInputGroupContainer: {
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  dateInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  dateText: {
    color: COLORS.teal700,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray300,
    width: '100%',
  },
  dateRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
});
