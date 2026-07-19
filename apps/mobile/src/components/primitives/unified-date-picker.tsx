import dayjs, { Dayjs } from 'dayjs';
import React, { useState, useRef } from 'react';
import {
  Text,
  Pressable,
  StyleSheet,
  View,
  Modal,
  FlatList,
  type FlatList as FlatListType,
} from 'react-native';

import { Button } from '@/components/primitives/button';
import {
  SegmentedControl,
  type SegmentedControlItem,
} from '@/components/primitives/segmented-control';
import { type DatePickerMode } from '@/constants/date-constants';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/style-constants';

import { PressableOpacity } from './pressable-opacity';

interface UnifiedDatePickerProps {
  visible: boolean;
  onClose: () => void;
  value: Dayjs;
  currentMode: DatePickerMode;
  onChange: (date: Dayjs, mode: DatePickerMode) => void;
  // The selectable granularities, shown left-to-right in the switcher. A single entry hides the switcher.
  modes: DatePickerMode[];
}

const ITEM_HEIGHT = 40;

// Switcher tab label per mode. Only the modes a caller passes are actually rendered.
const MODE_LABEL: Record<DatePickerMode, string> = {
  day: 'Theo Ngày',
  month: 'Theo Tháng',
  year: 'Theo Năm',
};

// "Jump to current" label, phrased per granularity.
const CURRENT_PERIOD_LABEL: Record<DatePickerMode, string> = {
  day: 'Hôm nay',
  month: 'Tháng này',
  year: 'Năm nay',
};

interface PickerColumnProps {
  title: string;
  data: number[];
  listRef: React.RefObject<FlatListType<number> | null>;
  selectedValue: number;
  formatItemLabel: (value: number) => string;
  onSelect: (value: number) => void;
}

function PickerColumn({
  title,
  data,
  listRef,
  selectedValue,
  formatItemLabel,
  onSelect,
}: PickerColumnProps) {
  return (
    <View style={styles.column}>
      <Text style={styles.columnTitle}>{title}</Text>
      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={(item) => String(item)}
        showsVerticalScrollIndicator
        initialScrollIndex={data.indexOf(selectedValue)}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        renderItem={({ item }) => {
          const isActive = item === selectedValue;
          return (
            <Pressable
              style={[styles.item, isActive && styles.activeItem]}
              onPress={() => onSelect(item)}
            >
              <Text style={[styles.itemText, isActive && styles.activeText]}>
                {formatItemLabel(item)}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

export function UnifiedDatePicker({
  visible,
  onClose,
  value,
  currentMode,
  onChange,
  modes,
}: UnifiedDatePickerProps) {
  // ─── Two mode states: one light (drives the pill), one heavy (drives the columns) ─────
  // Swapping the day/month/year columns remounts FlatLists — heavy work that, if run on the
  // tap, blocks the pill animation from starting and makes the switch feel laggy.
  // `selectedMode` updates immediately on tap so the pill slides right away; `pickerMode` is
  // deferred to the SegmentedControl's onSettled so the columns only swap after the slide.
  const [selectedMode, setSelectedMode] = useState<DatePickerMode>(currentMode);
  const [pickerMode, setPickerMode] = useState<DatePickerMode>(currentMode);
  const [pickerValue, setPickerValue] = useState<Dayjs>(value);

  // The switcher tabs, one per selectable mode passed by the caller (order preserved).
  const modeItemList: SegmentedControlItem<DatePickerMode>[] = modes.map((mode) => ({
    value: mode,
    label: MODE_LABEL[mode],
  }));

  const dayListRef = useRef<FlatListType<number>>(null);
  const monthListRef = useRef<FlatListType<number>>(null);
  const yearListRef = useRef<FlatListType<number>>(null);

  const [prevVisible, setPrevVisible] = useState(visible);
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) {
      setPickerValue(value);
      setSelectedMode(currentMode);
      setPickerMode(currentMode);
    }
  }

  const currentYear = dayjs().year();
  const startYear = currentYear - 10;
  const totalYears = 21;
  const years = Array.from({ length: totalYears }, (_, index) => startYear + index);

  const totalMonths = 12;
  const months = Array.from({ length: totalMonths }, (_, index) => index);

  const daysInMonth = pickerValue.daysInMonth();
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);

  const handleConfirm = () => {
    // Confirm with selectedMode (the tab last tapped), not pickerMode, so a confirm within
    // the pill's settle window still reflects the user's chosen granularity.
    onChange(pickerValue, selectedMode);
    onClose();
  };

  // Handle edge cases of invalid day when changing month
  // Example:
  // 1. When in 31/01, switch to 02 (February has only 28/29 days)
  // 2. This ensures the day is adjusted to the maximum valid day according to the new month.
  const adjustValidDay = (nextDate: Dayjs) => {
    const maxDays = nextDate.daysInMonth();
    if (pickerValue.date() > maxDays) {
      return nextDate.date(maxDays);
    }
    return nextDate;
  };

  const scrollToDate = (date: Dayjs) => {
    dayListRef.current?.scrollToIndex({
      index: date.date() - 1,
      animated: true,
      // scroll to the middle of the viewable area (the list column)
      viewPosition: 0.5,
    });
    monthListRef.current?.scrollToIndex({
      index: date.month(),
      animated: true,
      viewPosition: 0.5,
    });
    yearListRef.current?.scrollToIndex({
      index: years.indexOf(date.year()),
      animated: true,
      viewPosition: 0.5,
    });
  };

  const handleGoToToday = () => {
    const today = dayjs();
    setPickerValue(today);
    scrollToDate(today);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          <View style={styles.modalHeader}>
            {modes.length > 1 && (
              <SegmentedControl
                items={modeItemList}
                value={selectedMode}
                onChange={setSelectedMode}
                onSettled={setPickerMode}
                style={{
                  track: styles.switcherTrack,
                  pill: styles.switcherPill,
                  segment: styles.switcherSegment,
                  label: styles.switcherLabel,
                  activeLabel: styles.switcherActiveLabel,
                }}
              />
            )}
            <PressableOpacity style={styles.todayButton} onPress={handleGoToToday}>
              <Text style={styles.todayButtonText}>{CURRENT_PERIOD_LABEL[selectedMode]}</Text>
            </PressableOpacity>
          </View>

          <View style={styles.pickerWrapper}>
            {/* Day column only in day mode; month column in day/month (hidden when narrowed to year). */}
            {pickerMode === 'day' && (
              <PickerColumn
                title="Ngày"
                data={days}
                listRef={dayListRef}
                selectedValue={pickerValue.date()}
                formatItemLabel={(day) => String(day)}
                onSelect={(day) => setPickerValue(pickerValue.date(day))}
              />
            )}

            {pickerMode !== 'year' && (
              <PickerColumn
                title="Tháng"
                data={months}
                listRef={monthListRef}
                selectedValue={pickerValue.month()}
                formatItemLabel={(month) => `Tháng ${month + 1}`}
                onSelect={(month) => setPickerValue(adjustValidDay(pickerValue.month(month)))}
              />
            )}

            <PickerColumn
              title="Năm"
              data={years}
              listRef={yearListRef}
              selectedValue={pickerValue.year()}
              formatItemLabel={(year) => String(year)}
              onSelect={(year) => setPickerValue(adjustValidDay(pickerValue.year(year)))}
            />
          </View>

          <View style={styles.buttonGroup}>
            <Button style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Huỷ</Text>
            </Button>
            <Button style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>Xác nhận</Text>
            </Button>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 320,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
  },
  modalHeader: {
    alignItems: 'center',
    gap: SPACING.sm,
    paddingBottom: SPACING.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray300,
  },
  todayButton: {},
  todayButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
    textDecorationLine: 'underline',
  },
  switcherTrack: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    padding: 2,
    borderColor: COLORS.teal700,
  },
  switcherPill: {
    backgroundColor: COLORS.teal700,
  },
  switcherSegment: {
    height: 30,
  },
  switcherLabel: {
    color: COLORS.teal700,
  },
  switcherActiveLabel: {
    color: COLORS.white,
  },
  pickerWrapper: {
    flexDirection: 'row',
    height: 240,
    marginTop: SPACING.md,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  columnTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.gray400,
  },
  item: {
    height: 32,
    marginVertical: SPACING.xs,
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
  },
  activeItem: {
    backgroundColor: COLORS.green50,
  },
  itemText: {
    fontSize: FONT_SIZES.base,
  },
  activeText: {
    color: COLORS.teal700,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.gray300,
    paddingTop: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: COLORS.teal700,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal700,
  },
  confirmButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
  },
});

export default UnifiedDatePicker;
