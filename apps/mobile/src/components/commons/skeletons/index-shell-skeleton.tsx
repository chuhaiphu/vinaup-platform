import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Skeleton } from '@/components/primitives/skeleton';
import { COLORS, HEADER_HEIGHT, SPACING } from '@/constants/style-constants';

export function IndexShellSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Mock Header */}
      <View style={[styles.header, { paddingTop: insets.top, height: insets.top + HEADER_HEIGHT }]}>
        <Skeleton style={styles.headerSkeleton} borderRadius={4} />
      </View>

      {/* Mock Body content */}
      <View style={styles.body}>
        <View style={styles.summaryBar}>
          <Skeleton style={styles.summaryItem} borderRadius={6} />
        </View>

        <View style={styles.cardContainer}>
          <Skeleton style={styles.card} borderRadius={12} />
          <Skeleton style={styles.card} borderRadius={12} />
          <Skeleton style={styles.card} borderRadius={12} />
        </View>
      </View>

      {/* Mock Tab bar */}
      <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
        <View style={styles.tabItem}>
          <Skeleton style={styles.tabIcon} borderRadius={10} />
          <Skeleton style={styles.tabLabel} borderRadius={2} />
        </View>
        <View style={styles.tabItem}>
          <Skeleton style={styles.tabIcon} borderRadius={10} />
          <Skeleton style={styles.tabLabel} borderRadius={2} />
        </View>
        <View style={styles.tabItem}>
          <Skeleton style={styles.tabIcon} borderRadius={10} />
          <Skeleton style={styles.tabLabel} borderRadius={2} />
        </View>
        <View style={styles.tabItem}>
          <Skeleton style={styles.tabIcon} borderRadius={10} />
          <Skeleton style={styles.tabLabel} borderRadius={2} />
        </View>
        <View style={styles.tabItem}>
          <Skeleton style={styles.tabIcon} borderRadius={10} />
          <Skeleton style={styles.tabLabel} borderRadius={2} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray300,
  },
  headerSkeleton: {
    height: 24,
    flex: 1,
  },
  body: {
    flex: 1,
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  summaryBar: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  summaryItem: {
    flex: 1,
    height: 48,
  },
  cardContainer: {
    flex: 1,
    gap: SPACING.lg,
  },
  card: {
    height: 120,
    width: '100%',
  },
  tabBar: {
    height: 60 + 10,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray300,
    backgroundColor: COLORS.gray50,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  tabIcon: {
    width: 24,
    height: 24,
  },
  tabLabel: {
    width: 40,
    height: 10,
  },
});
