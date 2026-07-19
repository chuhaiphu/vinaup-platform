import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { FONT_SIZES, RADIUS, SPACING } from '@/constants/style-constants';

interface UtilityItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

interface IndexUtilityGridProps {
  items: UtilityItem[];
  onItemPress: (key: string) => void;
}

export const IndexUtilityGrid = ({ items, onItemPress }: IndexUtilityGridProps) => {
  if (items.length === 0) return null;

  return (
    <View style={styles.gridContainer}>
      {items.map((item) => (
        <PressableOpacity
          key={item.key}
          style={styles.gridItem}
          onPress={() => onItemPress(item.key)}
        >
          <View style={styles.iconBox}>{item.icon}</View>
          <Text style={styles.gridText} numberOfLines={2} ellipsizeMode="tail">
            {item.label}
          </Text>
        </PressableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  gridItem: {
    width: '30%',
    // backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    justifyContent: 'flex-start',
    // boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.2)',
  },
  iconBox: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  gridText: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
});
