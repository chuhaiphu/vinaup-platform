import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { COLORS, RADIUS, SPACING } from '@/constants/style-constants';

interface FieldsetViewProps {
  /** Cutout on the left of the top border — the fieldset's legend (HTML <fieldset><legend> equivalent). */
  legendLeft?: ReactNode;
  /** Cutout on the right of the top border. Can be combined with legendLeft. */
  legendRight?: ReactNode;
  children: ReactNode;
  style?: {
    /** Override the bordered container (e.g. borderColor, padding). */
    border?: StyleProp<ViewStyle>;
    /** Override the left legend cutout sitting on the top border. */
    legendLeftContainer?: StyleProp<ViewStyle>;
    /** Override the right legend cutout sitting on the top border. */
    legendRightContainer?: StyleProp<ViewStyle>;
  };
}

export function FieldsetView({ legendLeft, legendRight, children, style }: FieldsetViewProps) {
  return (
    <View style={[styles.container, style?.border]}>
      {legendLeft ? (
        <View
          style={[styles.legendContainer, styles.legendContainerLeft, style?.legendLeftContainer]}
        >
          {legendLeft}
        </View>
      ) : null}
      {legendRight ? (
        <View
          style={[styles.legendContainer, styles.legendContainerRight, style?.legendRightContainer]}
        >
          {legendRight}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  legendContainer: {
    position: 'absolute',
    top: -8,
    paddingHorizontal: SPACING.xs,
    backgroundColor: COLORS.white,
    zIndex: 1,
  },
  legendContainerLeft: {
    left: 10,
  },
  legendContainerRight: {
    right: 8,
  },
});
