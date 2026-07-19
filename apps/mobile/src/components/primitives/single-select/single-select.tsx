import Ionicons from '@react-native-vector-icons/ionicons/static';
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import { COLORS, FONT_SIZES, FONT_WEIGHTS, ICON_SIZES, SPACING } from '@/constants/style-constants';

import { PressableOpacity } from '../pressable-opacity';
import { SingleSelectProps } from './types';

/**
 * A scrollable list of selectable options that supports single selection.
 *
 * Each option renders a row with an optional left section, a label, and a checkbox indicator on the right.
 *
 * Tapping an option fires `onSelectOption` with the updated value.
 *
 * The default row UI can be replaced entirely by passing `renderOption`.
 */
export function SingleSelect({ options, value, onSelectOption, renderOption }: SingleSelectProps) {
  const handleSelect = (selectedValue: string) => {
    onSelectOption(selectedValue);
  };

  return (
    <ScrollView bounces={false} contentContainerStyle={styles.listPadding}>
      {options.map((item) => {
        const isSelected = item.value === value;
        if (renderOption) {
          return (
            <View key={item.value}>
              {renderOption(item, isSelected, () => handleSelect(item.value || ''))}
            </View>
          );
        }
        return (
          <PressableOpacity
            key={item.value}
            style={[styles.optionItem, isSelected && styles.optionSelected]}
            onPress={() => handleSelect(item.value || '')}
          >
            <View style={styles.optionLeftContent}>
              {item.leftSection}
              <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                {item.label}
              </Text>
            </View>
            {isSelected && (
              <Ionicons name="checkmark-circle" size={ICON_SIZES.md} color={COLORS.teal700} />
            )}
          </PressableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  listPadding: {
    paddingBottom: SPACING.xl,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  optionLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  optionSelected: {
    backgroundColor: COLORS.gray100,
  },
  optionText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray700,
  },
  optionTextActive: {
    color: COLORS.teal700,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
