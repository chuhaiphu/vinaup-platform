import React, { useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardTypeOptions,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';

import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/style-constants';

export type FlatTextInputProps = {
  label: string;
  value: string;
  onChangeText: (val: string) => void;
  alignLabel?: 'left' | 'right';
  alignValue?: 'left' | 'right';
  error?: string | boolean;
  keyboardType?: KeyboardTypeOptions;
  placeholder?: string;
  maxLength?: number;
  editable?: boolean;
  labelLeftSection?: React.ReactNode;
  labelRightSection?: React.ReactNode;
  valueLeftSection?: React.ReactNode;
  valueRightSection?: React.ReactNode;
  style?: {
    /** Outer wrapper holding both rows. */
    container?: StyleProp<ViewStyle>;
    /** The label text itself — not the row, which also holds the label sections. */
    label?: StyleProp<TextStyle>;
    /** The underlined row holding the value sections and the input. */
    inputContainer?: StyleProp<ViewStyle>;
    input?: StyleProp<TextStyle>;
  };
};

export function FlatTextInput({
  label,
  value,
  onChangeText,
  alignLabel = 'left',
  alignValue = 'left',
  error,
  keyboardType,
  placeholder,
  maxLength,
  editable,
  labelLeftSection,
  labelRightSection,
  valueLeftSection,
  valueRightSection,
  style,
}: FlatTextInputProps) {
  const inputRef = useRef<TextInput>(null);

  const isDisabled = editable === false;

  // Slot overrides sit AFTER the base style but BEFORE the disabled/error styles,
  // so a caller can restyle a field yet never style its error state away.
  return (
    <View style={[styles.container, style?.container]}>
      <View style={styles.row}>
        {labelLeftSection}
        <Text
          style={[
            styles.label,
            { textAlign: alignLabel },
            style?.label,
            isDisabled && styles.labelDisabled,
            !!error && styles.labelError,
          ]}
          onPress={() => inputRef.current?.focus()}
        >
          {label}
        </Text>
        {labelRightSection}
      </View>
      <View
        style={[
          styles.inputContainer,
          styles.row,
          style?.inputContainer,
          !!error && styles.inputContainerError,
        ]}
      >
        {valueLeftSection}
        <TextInput
          ref={inputRef}
          style={[styles.input, { textAlign: alignValue }, style?.input]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholder={isDisabled ? undefined : placeholder}
          placeholderTextColor={COLORS.gray400}
          maxLength={maxLength}
          editable={editable}
        />
        {valueRightSection}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
  },
  labelDisabled: {
    color: COLORS.teal900,
  },
  labelError: {
    color: COLORS.red600,
  },
  inputContainer: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray400,
  },
  inputContainerError: {
    borderBottomColor: COLORS.red600,
  },
  input: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal900,
  },
});
