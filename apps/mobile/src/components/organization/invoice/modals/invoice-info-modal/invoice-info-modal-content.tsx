import dayjs, { Dayjs } from 'dayjs';
import { useImperativeHandle, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ConfirmSlideSheetContentRef } from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { DateTimePicker } from '@/components/primitives/date-time-picker';
import { FlatTextInput } from '@/components/primitives/flat-text-input';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '@/constants/style-constants';

interface InvoiceInfoModalContentProps {
  invDescription?: string;
  invCode?: string;
  invStartDate?: string;
  invNote?: string | null;
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

export function InvoiceInfoModalContent({
  invDescription = '',
  invCode = '',
  invStartDate,
  invNote = '',
  isLoading = false,
  onSubmit,
  ref,
}: InvoiceInfoModalContentProps) {
  const [description, setDescription] = useState(invDescription);
  const [code, setCode] = useState(invCode);
  const [startDate, setStartDate] = useState<Dayjs>(dayjs(invStartDate));
  const [note, setNote] = useState(invNote ?? '');
  const [inputErrors, setInputErrors] = useState<{
    description?: boolean;
  }>({});

  const handleConfirm = () => {
    const errors: typeof inputErrors = {};
    if (!description.trim()) errors.description = true;
    setInputErrors(errors);
    if (Object.keys(errors).length > 0) return;

    onSubmit?.({
      description,
      startDate: startDate.toISOString(),
      endDate: startDate.hour(23).minute(59).toISOString(),
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

      <View style={styles.inputGroup}>
        <View style={styles.dateInputGroupContainer}>
          <View style={[styles.inputGroup, styles.dateInputGroup]}>
            <Text style={styles.inputLabel}>Ngày</Text>
            <View style={styles.dateTimeRow}>
              <DateTimePicker
                style={{ dateText: styles.dateText }}
                mode="date"
                value={startDate}
                onChange={(d) => {
                  setStartDate(startDate.year(d.year()).month(d.month()).date(d.date()));
                }}
                displayFormat="DD/MM/YYYY"
                disabled={isLoading}
              />
              <DateTimePicker
                mode="time"
                style={{ dateText: styles.dateText }}
                value={startDate}
                onChange={(d) => {
                  setStartDate(startDate.hour(d.hour()).minute(d.minute()));
                }}
                displayFormat="HH:mm"
                disabled={isLoading}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
