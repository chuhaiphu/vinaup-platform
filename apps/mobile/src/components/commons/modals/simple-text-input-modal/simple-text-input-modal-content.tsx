import { useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, TextInput, View, Keyboard } from 'react-native';

import { ConfirmSlideSheetContentRef } from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '@/constants/style-constants';

interface SimpleTextInputModalContentProps {
  maxLength?: number;
  numberOfLines?: number;
  value?: string | null;
  placeholder?: string;
  isLoading?: boolean;
  onSubmit?: (value: string) => void;
  ref?: React.RefObject<ConfirmSlideSheetContentRef | null>;
}

export function SimpleTextInputModalContent({
  maxLength = 100,
  numberOfLines = 1,
  value = '',
  placeholder,
  isLoading = false,
  onSubmit,
  ref,
}: SimpleTextInputModalContentProps) {
  const [tempValue, setTempValue] = useState(value || '');
  const inputRef = useRef<TextInput>(null);

  const handleConfirm = () => {
    Keyboard.dismiss();
    onSubmit?.(tempValue);
  };

  useImperativeHandle(ref, () => ({ submit: handleConfirm }));

  const isMultiline = numberOfLines > 1;

  return (
    <View>
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          isMultiline && styles.inputMultiline,
          isMultiline && { minHeight: numberOfLines * 24 },
        ]}
        maxLength={maxLength}
        value={tempValue}
        onChangeText={setTempValue}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray400}
        multiline={isMultiline}
        numberOfLines={isMultiline ? numberOfLines : undefined}
        returnKeyType={isMultiline ? undefined : 'done'}
        editable={!isLoading}
        autoFocus
        onSubmitEditing={isMultiline ? undefined : handleConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
  },
  inputMultiline: {
    textAlignVertical: 'top',
  },
});
