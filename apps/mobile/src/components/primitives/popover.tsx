import Ionicons from '@react-native-vector-icons/ionicons/static';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons/static';
import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, View, Text } from 'react-native';

import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ICON_SIZES,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';

import { PressableOpacity } from './pressable-opacity';

// ─── Variant registry ────────────────────────────────────────────────
// Single source of truth for popover look-and-feel.
type PopoverVariant = 'info' | 'warning';

const VARIANT_STYLE: Record<
  PopoverVariant,
  {
    icon: React.ReactNode;
    backgroundColor: string;
    borderColor: string;
  }
> = {
  info: {
    icon: (
      <MaterialCommunityIcons name="lightbulb-on" size={ICON_SIZES.lg} color={COLORS.yellow400} />
    ),
    backgroundColor: COLORS.yellow50,
    borderColor: COLORS.yellow200,
  },
  warning: {
    icon: <Ionicons name="warning" size={ICON_SIZES.lg} color={COLORS.orange500} />,
    backgroundColor: COLORS.orange50,
    borderColor: COLORS.orange300,
  },
};

interface PopoverProps {
  isVisible: boolean;
  onClose: () => void;
  variant: PopoverVariant;
  title: string;
  children?: React.ReactNode;

  position?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  style?: {
    container?: StyleProp<ViewStyle>;
    content?: StyleProp<ViewStyle>;
  };
}

export function Popover({
  isVisible,
  onClose,
  variant,
  title,
  children,
  position = { top: 200, left: 8, right: 8 },
  style,
}: PopoverProps) {
  if (!isVisible) return null;

  const variantStyle = VARIANT_STYLE[variant];

  return (
    <View
      style={[
        styles.container,
        position,
        { backgroundColor: variantStyle.backgroundColor, borderColor: variantStyle.borderColor },
        style?.container,
      ]}
    >
      <View style={styles.headerContainer}>
        <View style={styles.headerRowLeft}>
          {variantStyle.icon}
          <Text style={styles.titleText}>{title}</Text>
        </View>
        <PressableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={ICON_SIZES.lg} color={COLORS.orange500} />
        </PressableOpacity>
      </View>
      <View style={[styles.content, style?.content]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderRadius: RADIUS.md,
    // Border is always present; only the color changes per variant.
    borderWidth: 1,
    zIndex: 1000,
    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.1)',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  headerRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  titleText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal900,
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  // Fixed placement so the X sits consistently in the top-right of every popover.
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 0,
  },
});
