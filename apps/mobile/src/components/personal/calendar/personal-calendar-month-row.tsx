import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import dayjs from 'dayjs';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, ICON_SIZES, SPACING } from '@/constants/style-constants';
import { useToastStore } from '@/hooks/use-toast-store';

export interface PersonalCalendarMonthRowProps {
  monthStart: dayjs.Dayjs;
  days: dayjs.Dayjs[];
  onDayPress?: (day: dayjs.Dayjs) => void;
  onMonthPress?: (month: dayjs.Dayjs) => void;
}

export function PersonalCalendarMonthRow({
  monthStart,
  days,
  onDayPress,
  onMonthPress,
}: PersonalCalendarMonthRowProps) {
  const handleCopy = useCallback(async () => {
    // ─── Step 1: Format text with month context ───────────────────────
    // Include month/year so the pasted text is meaningful out of context
    const dayNumbers = days.map((d) => d.date()).join(', ') || '-';
    const text = `Tháng ${monthStart.month() + 1}/${monthStart.year()}: ${dayNumbers}`;

    // ─── Step 2: Clipboard → haptic → toast ──────────────────────────
    // Use getState() instead of hook subscription — 12 row instances in the
    // ScrollView only write toast state, never need to read it
    await Clipboard.setStringAsync(text);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    useToastStore.getState().showToast(`Đã sao chép lịch tháng ${monthStart.month() + 1}`);
  }, [days, monthStart]);

  function renderDay(d: dayjs.Dayjs) {
    if (onDayPress) {
      return (
        <PressableOpacity key={d.toISOString()} onPress={() => onDayPress(d)} hitSlop={4}>
          <Text style={styles.dayTextActive}>{d.date()},</Text>
        </PressableOpacity>
      );
    }
    return (
      <Text key={d.toISOString()} style={styles.dayText}>
        {d.date()},
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {onMonthPress ? (
          <PressableOpacity onPress={() => onMonthPress(monthStart)} hitSlop={8}>
            <Text style={styles.monthTitle}>Tháng {monthStart.month() + 1}</Text>
          </PressableOpacity>
        ) : (
          <Text style={styles.monthTitle}>Tháng {monthStart.month() + 1}</Text>
        )}
        <PressableOpacity onPress={handleCopy} hitSlop={8}>
          <FontAwesome5 name="copy" size={ICON_SIZES.md} color={COLORS.teal700} />
        </PressableOpacity>
      </View>
      <View style={styles.daysRow}>
        {days.length > 0 ? days.map(renderDay) : <Text style={styles.dayText}>-</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.gray300,
    gap: SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  dayText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
  },
  dayTextActive: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal700,
  },
});
