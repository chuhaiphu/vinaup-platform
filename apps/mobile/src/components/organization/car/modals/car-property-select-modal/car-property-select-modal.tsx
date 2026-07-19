import Ionicons from '@react-native-vector-icons/ionicons/static';
import { useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import {
  ConfirmSlideSheet,
  ConfirmSlideSheetContentRef,
} from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SingleSelect } from '@/components/primitives/single-select/single-select';
import { SingleSelectOption } from '@/components/primitives/single-select/types';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ICON_SIZES,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';

interface CarPropertySelectModalProps {
  modalRef: React.RefObject<SlideSheetRef | null>;
  title: string;
  options: SingleSelectOption[];
  value: string;
  searchPlaceholder?: string;
  onConfirm: (value: string) => void;
}

export function CarPropertySelectModal({
  modalRef,
  title,
  options,
  value,
  searchPlaceholder,
  onConfirm,
}: CarPropertySelectModalProps) {
  const modalContentRef = useRef<ConfirmSlideSheetContentRef | null>(null);

  return (
    <ConfirmSlideSheet
      ref={modalRef}
      title={title}
      confirmText="Chọn"
      heightPercentage={0.7}
      // Body is a SingleSelect that scrolls internally + fills the sheet; no outer scroll.
      scrollable={false}
      onConfirmPress={() => modalContentRef.current?.submit()}
    >
      <CarPropertySelectModalContent
        ref={modalContentRef}
        options={options}
        value={value}
        searchPlaceholder={searchPlaceholder}
        onSubmit={(selectedValue) => {
          onConfirm(selectedValue);
          modalRef.current?.close();
        }}
      />
    </ConfirmSlideSheet>
  );
}

interface CarPropertySelectModalContentProps {
  options: SingleSelectOption[];
  value: string;
  searchPlaceholder?: string;
  onSubmit: (value: string) => void;
  ref?: React.RefObject<ConfirmSlideSheetContentRef | null>;
}

function CarPropertySelectModalContent({
  options,
  value,
  searchPlaceholder = 'Tìm kiếm',
  onSubmit,
  ref,
}: CarPropertySelectModalContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  // ─── Pending selection ─────
  const [pending, setPending] = useState(value);

  const q = searchQuery.trim().toLowerCase();
  const filteredOptions = !q
    ? options
    : options.filter((option) => (option.label ?? '').toLowerCase().includes(q));

  const handleSelectOption = (selectedValue: string) => {
    setPending((prev) => (prev === selectedValue ? '' : selectedValue));
  };

  useImperativeHandle(ref, () => ({ submit: () => onSubmit(pending) }));

  return (
    <View style={styles.body}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={ICON_SIZES.md} color={COLORS.teal700} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={searchPlaceholder}
          placeholderTextColor={COLORS.gray400}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.listContainer}>
        <SingleSelect
          options={filteredOptions}
          value={pending}
          onSelectOption={handleSelectOption}
          renderOption={(option, isSelected, select) => (
            <PressableOpacity
              style={[styles.optionRow, isSelected && styles.optionRowActive]}
              onPress={select}
            >
              <Text
                style={[styles.optionLabel, isSelected && styles.optionLabelActive]}
                numberOfLines={1}
              >
                {option.label}
              </Text>
              <Ionicons
                name={isSelected ? 'radio-button-on-sharp' : 'radio-button-off-sharp'}
                size={ICON_SIZES.lg}
                color={isSelected ? COLORS.teal700 : COLORS.gray300}
              />
            </PressableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
    paddingVertical: 0,
  },
  listContainer: {
    flex: 1,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  optionRowActive: {
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.md,
  },
  optionLabel: {
    flexShrink: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.gray700,
  },
  optionLabelActive: {
    color: COLORS.teal700,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
