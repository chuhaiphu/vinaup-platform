import { useRouter } from 'expo-router';
import { prefetch } from 'fetchwire';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { getTripById } from '@/apis/trip/trip-apis';
import { TripCard } from '@/components/organization/trip/list/trip-card';
import { COLORS } from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { useOrganizationTripListContext } from '@/providers/organization/trip/organization-trip-list-provider';

export function OrganizationTripListSection() {
  const router = useRouter();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);
  const { trips, refreshFetch, isRefreshing } = useOrganizationTripListContext();

  const navigateToDetailScreen = async (id?: string) => {
    if (!id) return;
    setIsNavigating(true);
    try {
      await prefetch(() => getTripById(id), { fetchKey: `organization-trip-${id}` });
    } catch {
      // Fallback to normal navigation if prefetch fails.
    }
    router.push({
      pathname: '/(protected)/trip-detail/[tripId]',
      params: { tripId: id },
    });
    setIsNavigating(false);
  };

  return (
    <FlatList
      data={trips}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <Pressable onPress={() => navigateToDetailScreen(item.id)}>
          <TripCard trip={item} />
        </Pressable>
      )}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refreshFetch}
          colors={[COLORS.teal700]}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  separator: {
    height: 2,
  },
});
