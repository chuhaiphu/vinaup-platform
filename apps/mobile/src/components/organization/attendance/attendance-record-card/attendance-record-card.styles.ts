import { StyleSheet } from 'react-native';

import {
  CENTERED_TEXT,
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.sm,
  },
  content: {
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray400,
    padding: SPACING.sm,
  },
  contentCheckIn: {
    borderColor: COLORS.teal700,
  },
  contentOpen: {
    borderColor: COLORS.yellow400,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray700,
  },
  titleCheckInText: {
    color: COLORS.teal700,
  },
  titleOpenText: {
    color: COLORS.yellow700,
  },
  totalLabelText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray500,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  timeText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal900,
    ...CENTERED_TEXT,
  },
  durationText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
    ...CENTERED_TEXT,
  },
  detailContainer: {
    gap: SPACING.sm,
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  detailText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal900,
  },
});
