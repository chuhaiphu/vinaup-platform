import { StyleSheet, View } from 'react-native';

import { PaneSkeleton } from '@/components/commons/skeletons/pane-skeleton';
import { COLORS, RADIUS, SPACING } from '@/constants/style-constants';

// Mirrors the home tab layout (ticket box + description + members sections)
// shown behind the screen-level <Suspense> while TourImplementationProvider
// resolves the implementation entity.
export function TourImplementationHomeSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.ticketBox}>
        <PaneSkeleton height={24} />
      </View>
      <PaneSkeleton height={120} />
      <View style={styles.separator} />
      <PaneSkeleton height={160} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
  },
  ticketBox: {
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.teal700,
    boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.3)',
  },
  separator: {
    height: 8,
  },
});
