import React, { useRef } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardTypeOptions } from 'react-native';

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
}: FlatTextInputProps) {
  const inputRef = useRef<TextInput>(null);

  const isDisabled = editable === false;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {labelLeftSection}
        <Text
          style={[
            styles.label,
            styles.flexFill,
            { textAlign: alignLabel },
            isDisabled && styles.labelDisabled,
            !!error && styles.labelError,
          ]}
          onPress={() => inputRef.current?.focus()}
        >
          {label}
        </Text>
        {labelRightSection}
      </View>
      <View style={[styles.inputBorder, styles.row, !!error && styles.inputBorderError]}>
        {valueLeftSection}
        <TextInput
          ref={inputRef}
          style={[styles.input, styles.flexFill, { textAlign: alignValue }]}
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
  flexFill: {
    flex: 1,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
  },
  labelDisabled: {
    color: COLORS.teal900,
  },
  labelError: {
    color: COLORS.red600,
  },
  inputBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray400,
  },
  inputBorderError: {
    borderBottomColor: COLORS.red600,
  },
  input: {
    paddingHorizontal: 0,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal900,
  },
});
