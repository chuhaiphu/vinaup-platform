import { StyleSheet, View } from 'react-native';

import { Skeleton } from '@/components/primitives/skeleton';
import { RADIUS } from '@/constants/style-constants';

interface WhitePaneSkeletonProps {
  height: number;
}

export function PaneSkeleton({ height }: WhitePaneSkeletonProps) {
  return (
    <View style={styles.pane}>
      <Skeleton style={{ height: height }} borderRadius={4} />
    </View>
  );
}

const styles = StyleSheet.create({
  pane: {
    borderRadius: RADIUS.md,
    justifyContent: 'center',
  },
});
