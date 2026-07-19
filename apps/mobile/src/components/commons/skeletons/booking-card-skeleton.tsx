import { StyleSheet, View } from 'react-native';

import { Skeleton } from '@/components/primitives/skeleton';
import { RADIUS, SPACING } from '@/constants/style-constants';

export function BookingCardSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.contentTop}>
          <Skeleton style={styles.title} borderRadius={4} />
          <Skeleton style={styles.date} borderRadius={4} />
        </View>
        <View style={styles.contentBottom}>
          <Skeleton style={styles.sender} borderRadius={4} />
          <Skeleton style={styles.receiver} borderRadius={4} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  card: {
    borderRadius: RADIUS.lg,
  },
  contentTop: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 0.5,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  contentBottom: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 0.5,
    borderTopWidth: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  title: {
    height: 20,
    width: '100%',
  },
  date: {
    height: 16,
    width: '100%',
  },
  sender: {
    height: 18,
    width: '100%',
  },
  receiver: {
    height: 18,
    width: '100%',
  },
});
