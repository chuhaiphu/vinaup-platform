import { useRouter } from 'expo-router';
import { prefetch } from 'fetchwire';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { getTourById } from '@/apis/tour/tour-apis';
import { TourCard } from '@/components/organization/tour/list/tour-card';
import { COLORS } from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { useOrganizationTourListContext } from '@/providers/organization/tour/organization-tour-list-provider';

export type OrganizationTourListSectionProps = {
  organizationId: string;
  statusFilter: string;
};

export function OrganizationTourListSection(_props: OrganizationTourListSectionProps) {
  const router = useRouter();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);
  const { tours, refreshFetch, isRefreshing } = useOrganizationTourListContext();

  const navigateToDetailScreen = async (id?: string) => {
    if (!id) return;
    setIsNavigating(true);
    try {
      await prefetch(() => getTourById(id), { fetchKey: `organization-tour-${id}` });
    } catch {
      // Fallback to normal navigation if prefetch fails.
    }
    router.push({
      pathname: '/(protected)/tour-detail/[tourId]',
      params: { tourId: id },
    });
    setIsNavigating(false);
  };

  return (
    <>
      <FlatList
        data={tours}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigateToDetailScreen(item.id)}>
            <TourCard tour={item} />
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
    </>
  );
}

const styles = StyleSheet.create({
  separator: {
    height: 2,
  },
});
