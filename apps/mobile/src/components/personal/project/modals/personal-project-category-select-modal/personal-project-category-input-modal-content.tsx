import { useImperativeHandle, useRef, useState } from 'react';
import { Keyboard, StyleSheet, Text, TextInput, View } from 'react-native';

import { ConfirmSlideSheetContentRef } from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '@/constants/style-constants';

interface PersonalProjectCategoryInputModalContentProps {
  existingCategoryNames: string[];
  isLoading?: boolean;
  onSubmit?: (name: string) => void;
  ref?: React.RefObject<ConfirmSlideSheetContentRef | null>;
}

export function PersonalProjectCategoryInputModalContent({
  existingCategoryNames,
  isLoading = false,
  onSubmit,
  ref,
}: PersonalProjectCategoryInputModalContentProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | undefined>();
  const inputRef = useRef<TextInput>(null);

  const handleConfirm = () => {
    Keyboard.dismiss();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Tên thể loại không được để trống.');
      return;
    }
    if (existingCategoryNames.some((n) => n === trimmed)) {
      setError('Thể loại này đã tồn tại.');
      return;
    }
    setError(undefined);
    onSubmit?.(trimmed);
  };

  useImperativeHandle(ref, () => ({ submit: handleConfirm }));

  return (
    <View>
      <TextInput
        ref={inputRef}
        style={[styles.input, !!error && styles.inputError]}
        value={name}
        onChangeText={(v) => {
          setName(v);
          if (error) setError(undefined);
        }}
        placeholder="Tên thể loại..."
        placeholderTextColor={COLORS.gray400}
        maxLength={100}
        returnKeyType="done"
        editable={!isLoading}
        autoFocus
        onSubmitEditing={handleConfirm}
      />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
    marginBottom: SPACING.sm,
  },
  inputError: {
    borderColor: COLORS.red600,
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.red600,
    marginBottom: SPACING.md,
  },
});
