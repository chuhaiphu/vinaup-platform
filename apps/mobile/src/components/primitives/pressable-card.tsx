import React from 'react';
import { Pressable, PressableProps, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { COLORS, SPACING } from '@/constants/style-constants';

interface PressableCardProps extends Omit<PressableProps, 'style' | 'children'> {
  children: React.ReactNode;
  style?: {
    container?: StyleProp<ViewStyle>;
    card?: StyleProp<ViewStyle>;
  };
}

export function PressableCard({ children, style, ...pressableProps }: PressableCardProps) {
  if (!pressableProps.onPress) {
    return (
      <View style={[styles.container, style?.container]}>
        <View style={[styles.card, style?.card]}>{children}</View>
      </View>
    );
  }

  return (
    <Pressable {...pressableProps} style={[styles.container, style?.container]}>
      <View style={[styles.card, style?.card]}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {},
  card: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: COLORS.gray300,
  },
});
