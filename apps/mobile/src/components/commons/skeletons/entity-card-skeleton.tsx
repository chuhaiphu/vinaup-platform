import { StyleSheet, View } from 'react-native';

import { Skeleton } from '@/components/primitives/skeleton';
import { RADIUS, SPACING } from '@/constants/style-constants';

interface EntityCardSkeletonProps {
  withHeader?: boolean;
}

export function EntityCardSkeleton({ withHeader = false }: EntityCardSkeletonProps) {
  return (
    <View style={styles.container}>
      {withHeader && (
        <View style={styles.innerHeader}>
          <Skeleton style={styles.skeletonDateRange} borderRadius={4} />
          <Skeleton style={styles.skeletonStatus} borderRadius={4} />
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Skeleton style={styles.skeletonDescription} borderRadius={4} />
        </View>
        <View style={styles.bottomRow}>
          <Skeleton style={styles.skeletonPrice} borderRadius={4} />
          <View style={styles.gap} />
          <Skeleton style={styles.skeletonQuantity} borderRadius={4} />
          <View style={styles.gap} />
          <Skeleton style={styles.skeletonPrice} borderRadius={4} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.sm,
  },
  innerHeader: {
    marginVertical: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonDateRange: {
    width: 80,
    height: 18,
  },
  skeletonStatus: {
    width: 60,
    height: 16,
  },
  content: {
    gap: SPACING.xs,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.1)',
  },
  topRow: {
    flexDirection: 'row',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gap: {
    width: 8,
  },
  skeletonDescription: {
    flex: 1,
    height: 22,
  },
  skeletonPrice: {
    flex: 1,
    height: 22,
  },
  skeletonQuantity: {
    flex: 0.75,
    height: 22,
  },
});
