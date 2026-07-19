import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MultiSelect, MultiSelectOption } from '@/components/primitives/multi-select';
import { SlideSheet, SlideSheetRef } from '@/components/primitives/slide-sheet';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/style-constants';

interface UtilitySelectModalProps {
  options: MultiSelectOption[];
  values: string[];
  onUtilitySelect: (newSelectedUtilities: string[]) => void;
  utilitySelectRef: React.RefObject<SlideSheetRef | null>;
}

export function UtilitySelectModal({
  options,
  values,
  onUtilitySelect,
  utilitySelectRef,
}: UtilitySelectModalProps) {
  const insets = useSafeAreaInsets();
  return (
    <>
      <SlideSheet ref={utilitySelectRef} heightPercentage={0.3}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tiện ích</Text>
          <Text style={styles.headerSubtitle}>Nổi bật</Text>
        </View>

        <MultiSelect options={options} values={values} onOptionToggle={onUtilitySelect} />

        <View style={{ height: insets.bottom }} />
      </SlideSheet>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.teal700,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
  },
});
