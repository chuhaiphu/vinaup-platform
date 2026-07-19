import dayjs, { Dayjs } from 'dayjs';
import { useImperativeHandle, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import VinaupLeftRightArrows from '@/components/icons/vinaup-left-right-arrows.native';
import { ConfirmSlideSheetContentRef } from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { DateTimePicker } from '@/components/primitives/date-time-picker';
import { FlatTextInput } from '@/components/primitives/flat-text-input';
import { TextToggler } from '@/components/primitives/text-toggler';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '@/constants/style-constants';

interface TripInfoModalContentProps {
  tripDescription?: string;
  tripCode?: string;
  tripStartDate?: string;
  tripEndDate?: string;
  tripNote?: string | null;
  isLoading?: boolean;
  onSubmit?: (data: {
    description: string;
    startDate: string;
    endDate: string;
    code?: string;
    note?: string;
  }) => void;
  ref?: React.RefObject<ConfirmSlideSheetContentRef | null>;
}

export function TripInfoModalContent({
  tripDescription = '',
  tripCode = '',
  tripStartDate,
  tripEndDate,
  tripNote = '',
  isLoading = false,
  onSubmit,
  ref,
}: TripInfoModalContentProps) {
  const [description, setDescription] = useState(tripDescription);
  const [code, setCode] = useState(tripCode);
  const [startDate, setStartDate] = useState<Dayjs>(dayjs(tripStartDate));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs(tripEndDate));
  const [note, setNote] = useState(tripNote ?? '');
  const [inputErrors, setInputErrors] = useState<{
    description?: boolean;
  }>({});

  const isSameDay = startDate.isSame(endDate, 'day');
  const dateRangeType = isSameDay ? 'day' : 'period';

  const handleConfirm = () => {
    const errors: typeof inputErrors = {};
    if (!description.trim()) errors.description = true;
    setInputErrors(errors);
    if (Object.keys(errors).length > 0) return;

    onSubmit?.({
      description,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      code: code.trim() || undefined,
      note: note.trim() || undefined,
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
            description: !value.trim() ? true : undefined,
          }));
        }}
        alignLabel="left"
        alignValue="left"
        error={inputErrors.description}
        placeholder="..."
        maxLength={40}
        editable={!isLoading}
      />

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

      <View style={[styles.inputGroup, styles.dateRangeGroup]}>
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
  inputGroup: {
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  dateRangeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputLabel: {
    fontSize: FONT_SIZES.base,
    color: '#333',
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
});
