import { StyleSheet, View } from 'react-native';

import { Skeleton } from '@/components/primitives/skeleton';
import { SPACING } from '@/constants/style-constants';
import { useScreenHeader } from '@/hooks/use-screen-header';

export function EntityDetailSkeleton() {
  useScreenHeader({ title: 'Chi tiết' });

  return (
    <View>
      <View style={styles.statusContainer}>
        <Skeleton style={styles.statusSkeleton} borderRadius={4} />
      </View>
      <View style={styles.cardContainer}>
        <Skeleton style={styles.cardSkeleton} borderRadius={8} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statusContainer: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  statusSkeleton: {
    width: 100,
    height: 20,
  },
  cardContainer: {
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  cardSkeleton: {
    height: 96,
  },
});
