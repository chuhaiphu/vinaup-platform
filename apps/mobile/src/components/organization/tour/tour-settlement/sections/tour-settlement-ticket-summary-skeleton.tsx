import { StyleSheet, View } from 'react-native';

import { PaneSkeleton } from '@/components/commons/skeletons/pane-skeleton';
import { COLORS, RADIUS, SPACING } from '@/constants/style-constants';

export function TourSettlementTicketSummarySkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <PaneSkeleton height={360} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.sm,
  },
  innerContainer: {
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.teal700,
    boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.3)',
  },
});
