import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Skeleton } from '@/components/primitives/skeleton';
import { COLORS, SPACING } from '@/constants/style-constants';

export function FlatInputFormSkeleton() {
  return (
    <ScrollView style={styles.modalBody} bounces={false}>
      <View style={styles.modalBodyContainer}>
        <View style={styles.headerRowContainer}>
          <Skeleton style={styles.headerRowSkeleton} borderRadius={4} />
        </View>

        {Array.from({ length: 5 }).map((_, index) => (
          <View key={`input-item-skeleton-${index}`} style={styles.inputItem}>
            <Skeleton style={styles.labelSkeleton} borderRadius={4} />
            <View style={styles.inputBorder}>
              <Skeleton style={styles.valueSkeleton} borderRadius={4} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  modalBody: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  modalBodyContainer: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  headerRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerRowSkeleton: {
    width: '100%',
    height: 40,
  },
  categorySkeleton: {
    width: 160,
    height: 24,
  },
  inputItem: {
    marginVertical: SPACING.xs,
  },
  labelSkeleton: {
    width: 80,
    height: 16,
    marginBottom: SPACING.xs,
  },
  inputBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray400,
    paddingBottom: SPACING.sm,
  },
  valueSkeleton: {
    width: '60%',
    height: 20,
  },
});
