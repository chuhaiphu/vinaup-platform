import dayjs from 'dayjs';
import { StyleSheet, Text } from 'react-native';

import { DD_MM_DATE_FORMAT_SHORT, HH_MM_DATE_FORMAT_SHORT } from '@/constants/app-constants';
import { COLORS, FONT_SIZES } from '@/constants/style-constants';

interface DateRangeTextProps {
  start: string;
  end: string;
}

// Shared "DD/MM (HH:MM)" range used by the trip/tour/invoice list cards: the hour is
// rendered in a muted colour, so this can't be the plain-string generateDateRange util —
// it needs nested <Text> and therefore lives as a component.
export function DateRangeText({ start, end }: DateRangeTextProps) {
  const startDay = dayjs(start);
  const endDay = dayjs(end);

  // ─── Collapse to a single entry when both ends fall on the same day ─────
  // A single-day trip reads as "03/07 (08:00)" instead of repeating the same date twice.
  const isSameDay = startDay.isSame(endDay, 'day');

  return (
    <Text style={styles.range}>
      <DayPart day={startDay} />
      {!isSameDay && (
        <>
          {' - '}
          <DayPart day={endDay} />
        </>
      )}
    </Text>
  );
}

function DayPart({ day }: { day: dayjs.Dayjs }) {
  return (
    <>
      {day.format(DD_MM_DATE_FORMAT_SHORT)}{' '}
      <Text style={styles.hour}>({day.format(HH_MM_DATE_FORMAT_SHORT)})</Text>
    </>
  );
}

const styles = StyleSheet.create({
  range: {
    fontSize: FONT_SIZES.sm,
  },
  hour: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
  },
});
