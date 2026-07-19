import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import { COLORS, FONT_SIZES, RADIUS, SPACING } from '@/constants/style-constants';

import VinaupDoubleCheck from '../../icons/vinaup-double-check.native';
import { PressableOpacity } from '../pressable-opacity';
import { MultiSelectProps } from './types';

/**
 * A scrollable list of selectable options that supports multiple selection.
 *
 * Each option renders a row with an optional left section, a label, and a checkbox indicator on the right.
 *
 * Tapping an option toggles its selection state and fires `onOptionToggle` with the updated array of selected values.
 *
 * The default row UI can be replaced entirely by passing `renderOption`.
 *
 */
export function MultiSelect({
  options,
  values,
  onOptionToggle,
  renderOption,
  style,
}: MultiSelectProps) {
  const handleToggle = (toggledValue: string) => {
    const isSelected = values.includes(toggledValue);
    if (isSelected) {
      // Use filter to create a new array without the toggled value, ensuring immutability.
      onOptionToggle(values.filter((v) => v !== toggledValue));
    } else {
      // Use spread operator to create a new array with the added value, ensuring immutability.
      onOptionToggle([...values, toggledValue]);
    }
  };

  return (
    <ScrollView bounces={false} contentContainerStyle={styles.listPadding}>
      <View style={styles.card}>
        {options.map((item, index) => {
          const isSelected = values.includes(item.value);
          if (renderOption) {
            const option = renderOption(item.value, {
              index,
              isSelected,
              toggle: () => handleToggle(item.value),
            });
            return <React.Fragment key={item.value}>{option}</React.Fragment>;
          }
          return (
            <PressableOpacity
              key={item.value}
              style={[
                styles.optionItem,
                // Add divider (bottom border) to all except the last item
                index < options.length - 1 && styles.optionDivider,
              ]}
              onPress={() => handleToggle(item.value)}
            >
              <View style={styles.optionLeftContent}>
                {item.leftSection}
                <Text style={[styles.optionText, style?.optionText]}>{item.label}</Text>
              </View>
              <View style={styles.checkbox}>{isSelected && <VinaupDoubleCheck />}</View>
            </PressableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  listPadding: {
    paddingHorizontal: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  optionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray300,
  },
  optionLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
  },
  optionText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal700,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.xs,
    borderWidth: 1.5,
    borderColor: COLORS.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
