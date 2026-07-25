import React from 'react';
import { Text, StyleSheet, StyleProp, ViewStyle, TextStyle, View } from 'react-native';

import { COLORS, FONT_SIZES, SPACING } from '@/constants/style-constants';

import { PressableOpacity } from './pressable-opacity';

interface TextTogglerProps {
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
  textPair: [string, string];
  iconPair?: [React.ReactNode, React.ReactNode];
  iconPosition?: 'left' | 'right';
  currentIndex: number;
  disabled?: boolean;
  onToggle: () => void;
  style?: {
    container?: StyleProp<ViewStyle>;
    text?: StyleProp<TextStyle>;
  };
}

export function TextToggler({
  leftSection,
  rightSection,
  textPair,
  iconPair,
  currentIndex,
  iconPosition = 'left',
  disabled = false,
  onToggle,
  style,
}: TextTogglerProps) {
  const currentIcon = iconPair ? iconPair[currentIndex] : null;
  return (
    <PressableOpacity
      onPress={onToggle}
      disabled={disabled}
      style={[styles.container, style?.container]}
    >
      {leftSection && <View>{leftSection}</View>}
      {iconPosition === 'left' && <View>{currentIcon}</View>}
      <Text style={[styles.text, style?.text, disabled && styles.disabledText]}>
        {textPair[currentIndex]}
      </Text>
      {iconPosition === 'right' && <View>{currentIcon}</View>}
      {rightSection && <View>{rightSection}</View>}
    </PressableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  text: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal700,
  },
  disabledText: {
    color: COLORS.gray400,
  },
});
