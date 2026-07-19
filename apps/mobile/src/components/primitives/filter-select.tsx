import FontAwesome6 from '@react-native-vector-icons/fontawesome6/static';
import { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SingleSelect } from '@/components/primitives/single-select';
import { SingleSelectOption } from '@/components/primitives/single-select/types';
import { SlideSheet, SlideSheetRef } from '@/components/primitives/slide-sheet';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, ICON_SIZES, SPACING } from '@/constants/style-constants';

// ─── One list-filter trigger + its picker sheet ───────────────────────────────
export interface FilterSelectProps {
  /** Shown when nothing is selected; also the sheet header title. */
  placeholder: string;
  options: SingleSelectOption[];
  value: string;
  onChange: (value: string) => void;
  /** Aligns the trigger content when it shares a row with a sibling filter. */
  align?: 'left' | 'right';
}

export function FilterSelect({
  placeholder,
  options,
  value,
  onChange,
  align = 'left',
}: FilterSelectProps) {
  const sheetRef = useRef<SlideSheetRef>(null);
  const insets = useSafeAreaInsets();

  const selectedLabel = value ? options.find((o) => o.value === value)?.label : placeholder;

  return (
    <>
      <PressableOpacity
        style={[styles.trigger, align === 'right' && styles.triggerRight]}
        onPress={() => sheetRef.current?.open()}
      >
        <Text style={styles.triggerText} numberOfLines={1}>
          {selectedLabel}
        </Text>
        <FontAwesome6
          iconStyle="solid"
          name="caret-down"
          size={ICON_SIZES.sm}
          color={COLORS.teal700}
        />
      </PressableOpacity>
      <SlideSheet ref={sheetRef}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetHeaderTitle}>{placeholder}</Text>
        </View>
        <SingleSelect
          options={options}
          value={value}
          onSelectOption={(val) => sheetRef.current?.close(() => onChange(val))}
        />
        <View style={{ height: insets.bottom }} />
      </SlideSheet>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  triggerRight: {
    justifyContent: 'flex-end',
  },
  triggerText: {
    flexShrink: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
  },
  sheetHeader: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray300,
    alignItems: 'center',
  },
  sheetHeaderTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal900,
  },
});
