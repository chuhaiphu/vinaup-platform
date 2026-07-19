import { StyleSheet } from 'react-native';

import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/style-constants';

export const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: COLORS.green50,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.teal700,
  },
  expandedContent: {
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
    gap: SPACING.sm,
  },
  topContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.xs,
    padding: SPACING.sm,
  },
  innerTopContainer: {
    flex: 1,
  },
  cashContent: {
    gap: SPACING['2xs'],
    borderRightColor: COLORS.gray300,
    borderRightWidth: 1,
    paddingRight: SPACING.sm,
  },
  bankContent: {
    gap: SPACING['2xs'],
    paddingLeft: SPACING.sm,
  },
  innerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  innerLabel: {
    fontWeight: FONT_WEIGHTS.medium,
    paddingBottom: SPACING['2xs'],
  },
  bottomContainer: {
    alignItems: 'flex-end',
    gap: 0,
    borderBottomColor: COLORS.gray400,
    borderBottomWidth: 1,
    paddingBottom: SPACING.xs,
  },
  innerBottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
  },
  innerLeft: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  innerRight: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  remainingLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal900,
  },
  remainingValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal900,
  },
  percentInputContainer: {
    width: 52,
    paddingHorizontal: SPACING.xs,
    backgroundColor: COLORS.white,
  },
  percentInput: {
    height: 26,
    fontSize: FONT_SIZES.sm,
  },
  amountInputContainer: {
    flex: 1,
    paddingHorizontal: SPACING.xs,
    backgroundColor: COLORS.white,
  },
  amountInput: {
    height: 26,
    fontSize: FONT_SIZES.sm,
    flex: 1,
  },
  inputUnit: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
  },
  inputUnitDisabled: {
    color: COLORS.gray300,
  },
  typeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.gray400,
    paddingLeft: SPACING.xs,
  },
  typeToggleText: {
    color: COLORS.teal700,
    fontWeight: FONT_WEIGHTS.bold,
    fontSize: FONT_SIZES.sm,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: COLORS.gray400,
  },
  vatIncludedLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
  vatIncludedValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
  vatInfoPopoverContent: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  boldLabel: {
    fontWeight: FONT_WEIGHTS.bold,
  },
  boldValue: {
    fontWeight: FONT_WEIGHTS.bold,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.gray300,
    marginVertical: SPACING.xs,
    width: '60%',
  },
});
