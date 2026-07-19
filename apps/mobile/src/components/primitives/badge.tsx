import { StyleSheet, Text, View } from 'react-native';

import {
  BADGE_VARIANT,
  BadgeVariant,
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';

interface BadgeProps {
  variant: BadgeVariant;
  children: string;
  numberOfLines?: number;
}

const BADGE_VARIANT_STYLE: Record<BadgeVariant, { backgroundColor: string; color: string }> = {
  [BADGE_VARIANT.GREEN]: { backgroundColor: COLORS.green50, color: COLORS.teal700 },
  [BADGE_VARIANT.BLUE]: { backgroundColor: COLORS.blue50, color: COLORS.blue700 },
  [BADGE_VARIANT.ORANGE]: { backgroundColor: COLORS.orange50, color: COLORS.orange700 },
  [BADGE_VARIANT.RED]: { backgroundColor: COLORS.red50, color: COLORS.red700 },
  [BADGE_VARIANT.GRAY]: { backgroundColor: COLORS.white, color: COLORS.gray500 },
};

export function Badge({ variant, children, numberOfLines = 1 }: BadgeProps) {
  const variantStyle = BADGE_VARIANT_STYLE[variant];

  return (
    // alignSelf: 'flex-start' keeps the pill hugging its text instead of stretching to fill the parent row.
    <View style={[styles.container, { backgroundColor: variantStyle.backgroundColor }]}>
      <Text numberOfLines={numberOfLines} style={[styles.text, { color: variantStyle.color }]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.lg,
  },
  text: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
