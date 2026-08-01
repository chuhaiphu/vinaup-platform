import { StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';

import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/style-constants';

import { PressableOpacity } from './pressable-opacity';

export interface TextSwitcherOption<T extends string | number> {
  value: T;
  label: string;
}

interface TextSwitcherProps<T extends string | number> {
  options: readonly TextSwitcherOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  style?: {
    container?: StyleProp<ViewStyle>;
    text?: StyleProp<TextStyle>;
  };
}

/**
 * A one-tap value cycler: it shows the current option's label and advances to the next on press,
 * wrapping past the last back to the first.
 */
export function TextSwitcher<T extends string | number>({
  options,
  value,
  onChange,
  disabled,
  style,
}: TextSwitcherProps<T>) {
  const currentIndex = options.findIndex((option) => option.value === value);

  const handlePress = () => {
    if (options.length === 0) return;

    // `findIndex` returns -1 if the current `value` is not found in the `options` array
    // (e.g., initial state is invalid, or `options` were updated dynamically).
    if (currentIndex === -1 || currentIndex === options.length - 1) {
      onChange(options[0].value);
      return;
    }

    onChange(options[currentIndex + 1].value);
  };

  return (
    <PressableOpacity
      onPress={handlePress}
      disabled={disabled}
      style={[styles.container, style?.container, disabled && styles.containerDisabled]}
    >
      <Text style={[styles.text, style?.text, disabled && styles.textDisabled]}>
        {options[currentIndex]?.label ?? ''}
      </Text>
    </PressableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.teal700,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  containerDisabled: {
    backgroundColor: COLORS.gray100,
    borderColor: COLORS.gray300,
  },
  text: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.teal700,
  },
  textDisabled: {
    color: COLORS.gray300,
  },
});
