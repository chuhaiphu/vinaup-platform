import { StyleSheet } from 'react-native';

import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/style-constants';

export const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  container: {
    backgroundColor: COLORS.gray50,
    flex: 1,
  },
  backgroundLogo: {
    position: 'absolute',
    left: 0,
  },
  content: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  typeSwitcherRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    justifyContent: 'space-between',
  },
  typeBtnContainer: {
    width: 72,
  },
  typeBtn: {
    flex: 1,
    borderRadius: RADIUS.xs,
  },
  typeBtnInactive: {
    backgroundColor: COLORS.gray400,
  },
  // Disabled: lighter than inactive (gray300 < gray400) and faded with opacity
  typeBtnDisabled: {
    backgroundColor: COLORS.gray300,
    opacity: 0.5,
  },
  typeBtnActive: {
    backgroundColor: COLORS.teal700,
  },
  typeBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeBtnTextContainer: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    margin: SPACING['2xs'],
    // nested radius: outer RADIUS.xs (4) minus the 2px inset margin (token exception)
    borderRadius: 2,
    paddingVertical: SPACING['2xs'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBtnText: {
    color: COLORS.gray400,
    fontSize: FONT_SIZES.lg,
    textAlign: 'center',
  },
  typeBtnTextActive: {
    color: COLORS.teal700,
  },
  datePickerText: {
    color: COLORS.teal700,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    gap: SPACING.sm,
  },
  bankCashSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginLeft: 'auto',
  },
  bankCashSwitcherText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
  },
  bankCashSwitcherTextActive: {
    color: COLORS.teal700,
    fontWeight: FONT_WEIGHTS.bold,
  },
  bankCashSwitcherSeparator: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
  },
  summaryBlock: {
    marginVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SPACING.md,
    paddingVertical: SPACING['2xs'],
  },
  summaryInput: {
    flex: 1,
  },
  vatRateInputContainer: {
    width: 44,
    paddingHorizontal: SPACING.xs,
  },
  vatRateInput: {
    height: 28,
  },
  summaryLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.sm,
  },
  depositToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    borderLeftWidth: 1,
    justifyContent: 'center',
    paddingLeft: SPACING.xs,
  },
  depositToggleText: {
    color: COLORS.teal700,
    fontWeight: FONT_WEIGHTS.bold,
  },
  summaryValueContainer: {
    flexDirection: 'row',
    width: '50%',
  },
  // Deposit input has a fixed-width container (50%), so flex:1 gives the
  // TextInput a stable box — prevents the left-digit clipping on remeasure.
  summaryDepositInput: {
    flex: 1,
  },
  valueInnerContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  summaryAmount: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
  },
  summaryUnit: {
    fontSize: FONT_SIZES.sm,
  },
  // Unit shown inside an editable input (rightSection) — teal to match the input text
  summaryInputUnit: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
  },
  groupCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  groupCodeLabel: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal700,
    alignSelf: 'flex-start',
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginLeft: 'auto',
  },
  categorySelectorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
  },
  categorySelectorTextLocked: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
  },
});
