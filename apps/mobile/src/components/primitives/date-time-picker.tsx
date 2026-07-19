import NativeDatetimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import dayjs, { Dayjs } from 'dayjs';
import React, { useState } from 'react';
import { Text, Platform, StyleSheet, StyleProp, ViewStyle, TextStyle, View } from 'react-native';

import { COLORS, FONT_SIZES, SPACING } from '@/constants/style-constants';

import { PressableOpacity } from './pressable-opacity';

interface DateTimePickerProps {
  mode?: 'date' | 'time';
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
  /** display placeholder when `null` */
  value: Dayjs | null;
  onChange?: (date: Dayjs) => void;
  isLocked?: boolean;
  disabled?: boolean;
  displayFormat?: string;
  placeholder?: string;
  style?: {
    dateText?: StyleProp<TextStyle>;
    placeholderText?: StyleProp<TextStyle>;
    disabled?: StyleProp<ViewStyle>;
  };
}

export function DateTimePicker({
  mode = 'date',
  leftSection,
  rightSection,
  value,
  onChange,
  isLocked = false,
  disabled = false,
  displayFormat = 'DD/MM/YYYY',
  placeholder,
  style,
}: DateTimePickerProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  // Ngày để mở picker khi chưa có value: mặc định hôm nay (picker không nhận null).
  const pickerDate = value ?? dayjs();
  const isEmpty = value === null;
  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      const dateValue = dayjs(selectedDate);
      // For date mode, set it to the start of the day
      onChange?.(mode === 'date' ? dateValue.startOf('day') : dateValue);
    }
    if (Platform.OS === 'ios') {
      setShowDatePicker(false);
    }
  };

  const handleShowDatePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: pickerDate.toDate(),
        onChange: handleDateChange,
        mode: mode,
        is24Hour: true,
        positiveButton: { label: 'Xác nhận' },
        negativeButton: { label: 'Hủy bỏ' },
      });
    } else {
      setShowDatePicker(true);
    }
  };

  const isDisabled = isLocked || disabled;
  return (
    <>
      <PressableOpacity
        onPress={handleShowDatePicker}
        style={[isDisabled && styles.disabled, style?.disabled, styles.container]}
        disabled={isDisabled}
      >
        {leftSection && <View style={styles.leftSection}>{leftSection}</View>}
        {isEmpty && placeholder ? (
          <Text style={[styles.placeholderText, style?.placeholderText]}>{placeholder}</Text>
        ) : (
          <Text
            style={[
              styles.dateText,
              isDisabled && {
                color: COLORS.gray400,
              },
              style?.dateText,
            ]}
          >
            {pickerDate.format(displayFormat)}
          </Text>
        )}
        {rightSection && <View style={styles.rightSection}>{rightSection}</View>}
      </PressableOpacity>

      {Platform.OS === 'ios' && showDatePicker && (
        <NativeDatetimePicker
          value={pickerDate.toDate()}
          mode={mode}
          display="spinner"
          onChange={handleDateChange}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: COLORS.blue600,
    fontSize: FONT_SIZES.base,
  },
  placeholderText: {
    color: COLORS.gray400,
    fontSize: FONT_SIZES.base,
  },
  disabled: {
    opacity: 0.5,
  },
  leftSection: {
    marginRight: SPACING.sm,
  },
  rightSection: {
    marginLeft: SPACING.sm,
  },
});

export default DateTimePicker;
