import { StyleSheet } from 'react-native';

import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  LINE_HEIGHTS,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.sm,
  },
  contentTop: {
    gap: SPACING.xs,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderWidth: 0.5,
  },
  contentTopAttached: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  contentBottom: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 0.5,
    borderTopWidth: 0,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  groupCodeContainer: {
    flex: 1,
  },
  groupCodeText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
  },
  depositContainer: {
    gap: SPACING['2xs'],
    alignItems: 'flex-end',
  },
  depositText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
  },
  paymentText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  descriptionContainer: {
    flex: 2,
  },
  tagContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  quantityContainer: {
    flex: 0.75,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  unitPriceContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  totalPriceContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  descriptionText: {
    fontSize: FONT_SIZES.base,
    lineHeight: LINE_HEIGHTS.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
  },
  tagText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
  },
  unitPriceText: {
    fontSize: FONT_SIZES.base,
  },
  totalPriceText: {
    fontSize: FONT_SIZES.base,
  },
  multiplySign: {
    fontSize: FONT_SIZES.base,
  },
  quantityText: {
    fontSize: FONT_SIZES.base,
  },
  equalSign: {
    fontSize: FONT_SIZES.base,
  },
});
