import React, { useRef } from 'react';
import {
  TextInput,
  StyleSheet,
  KeyboardTypeOptions,
  Pressable,
  StyleProp,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';

import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/style-constants';

export type OutlinedTextInputProps = {
  value: string;
  onChangeText: (val: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  alignValue?: 'left' | 'right';
  error?: string | boolean;
  keyboardType?: KeyboardTypeOptions;
  placeholder?: string;
  maxLength?: number;
  isDisabled?: boolean;
  isLoading?: boolean;
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
  style?: {
    container?: StyleProp<ViewStyle>;
    input?: StyleProp<TextStyle>;
  };
};

export function OutlinedTextInput({
  value,
  onChangeText,
  onBlur,
  onFocus,
  alignValue = 'right',
  error,
  keyboardType,
  placeholder,
  maxLength,
  isDisabled = false,
  isLoading = false,
  leftSection,
  rightSection,
  style,
}: OutlinedTextInputProps) {
  const inputRef = useRef<TextInput>(null);

  return (
    <Pressable
      style={[
        styles.row,
        style?.container,
        isDisabled && styles.rowDisabled,
        !!error && styles.rowError,
      ]}
      onPress={() => inputRef.current?.focus()}
    >
      {leftSection}
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          { textAlign: alignValue },
          isDisabled && styles.inputDisabled,
          style?.input,
        ]}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        onFocus={onFocus}
        keyboardType={keyboardType}
        placeholder={isDisabled ? undefined : placeholder}
        placeholderTextColor={COLORS.gray400}
        maxLength={maxLength}
        editable={!isDisabled}
      />
      {isLoading ? (
        <ActivityIndicator size={10} color={COLORS.teal700} style={styles.loadingIndicator} />
      ) : (
        rightSection
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.teal700,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    gap: SPACING.xs,
    justifyContent: 'flex-end',
  },
  rowDisabled: {
    backgroundColor: COLORS.gray100,
    borderColor: COLORS.gray300,
  },
  rowError: {
    borderColor: COLORS.red600,
  },
  loadingIndicator: {
    padding: 0,
    margin: 0,
  },
  input: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    height: 32,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.teal700,
  },
  inputDisabled: {
    color: COLORS.gray300,
  },
});
