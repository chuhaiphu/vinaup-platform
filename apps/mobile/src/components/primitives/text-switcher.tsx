import React from 'react';
import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';

import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS } from '@/constants/style-constants';

interface TextSwitcherProps {
  textPair: [string, string];
  currentIndex: 0 | 1;
  onSwitch: (index: 0 | 1) => void;
  disabled?: boolean;
  style?: {
    container?: StyleProp<ViewStyle>;
    button?: StyleProp<ViewStyle>;
    text?: StyleProp<TextStyle>;
  };
}

export function TextSwitcher({
  textPair,
  currentIndex,
  onSwitch,
  disabled,
  style,
}: TextSwitcherProps) {
  return (
    <View style={[styles.container, style?.container, disabled && styles.containerDisabled]}>
      <Pressable
        onPress={() => onSwitch(0)}
        disabled={disabled}
        style={[
          styles.button,
          style?.button,
          currentIndex === 0 && styles.buttonActive,
          disabled && styles.buttonDisabled,
        ]}
      >
        <Text
          style={[
            styles.text,
            style?.text,
            currentIndex === 0 && styles.textActive,
            disabled && styles.textDisabled,
          ]}
        >
          {textPair[0]}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onSwitch(1)}
        disabled={disabled}
        style={[
          styles.button,
          style?.button,
          currentIndex === 1 && styles.buttonActive,
          disabled && styles.buttonDisabled,
        ]}
      >
        <Text
          style={[
            styles.text,
            style?.text,
            currentIndex === 1 && styles.textActive,
            disabled && styles.textDisabled,
          ]}
        >
          {textPair[1]}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.teal700,
    borderRadius: RADIUS.sm,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    // 1px inset keeps the active thumb clear of the 1px container border (token exception)
    margin: 1,
    borderRadius: RADIUS.xs,
  },
  buttonActive: {
    backgroundColor: COLORS.teal700,
  },
  text: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
  },
  textActive: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
  },
  containerDisabled: {
    opacity: 0.4,
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray300,
  },
  textDisabled: {
    color: COLORS.gray400,
  },
});
