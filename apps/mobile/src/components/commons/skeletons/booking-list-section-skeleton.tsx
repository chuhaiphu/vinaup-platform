import { StyleSheet, View } from 'react-native';

import { BookingCardSkeleton } from './booking-card-skeleton';

export function BookingListSectionSkeleton() {
  return (
    <View style={styles.container}>
      <BookingCardSkeleton />
      <View style={styles.separator} />
      <BookingCardSkeleton />
      <View style={styles.separator} />
      <BookingCardSkeleton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  separator: {
    height: 2,
  },
});
