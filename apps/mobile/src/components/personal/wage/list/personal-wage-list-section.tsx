import type { WageStatus } from '@vinaup-platform/validation';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { prefetch } from 'fetchwire';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { getWageById } from '@/apis/wage/wage-apis';
import { PersonalWageSummaryBar } from '@/components/personal/wage/bars/personal-wage-summary-bar';
import { WageCard } from '@/components/personal/wage/wage-card';
import { type DatePickerMode } from '@/constants/date-constants';
import { COLORS } from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { WageResponse } from '@/interfaces/wage-interfaces';
import { usePersonalWageListContext } from '@/providers/personal/wage/personal-wage-list-provider';
import { calculateReceiptPaymentsSummary } from '@/utils/calculator/calculate-receipt-payments-summary';

export interface PersonalWageListSectionProps {
  selectedDate: dayjs.Dayjs;
  statusFilter?: WageStatus;
  filterMode: DatePickerMode;
}

export function PersonalWageListSection(_props: PersonalWageListSectionProps) {
  const router = useRouter();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);
  const { wageList, receiptPayments, refreshFetch, isRefreshing } = usePersonalWageListContext();

  const navigateToDetail = async (wage: WageResponse) => {
    setIsNavigating(true);
    try {
      await prefetch(() => getWageById(wage.id), {
        fetchKey: `personal-wage-${wage.id}`,
      });
    } catch {
      // Fallback to normal navigation if prefetch fails.
    }
    router.push({
      pathname: '/(protected)/wage-detail/[wageId]',
      params: { wageId: wage.id },
    });
    setIsNavigating(false);
  };

  return (
    <View style={styles.listContainer}>
      <FlatList
        data={wageList}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const wageRPs = receiptPayments.filter((rp) => rp.wageId === item.id);
          const { totalRemaining } = calculateReceiptPaymentsSummary(wageRPs);
          return (
            <WageCard
              wage={item}
              onPress={() => navigateToDetail(item)}
              totalRemaining={totalRemaining}
            />
          );
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshFetch}
            colors={[COLORS.teal700]}
          />
        }
      />
      <PersonalWageSummaryBar wages={wageList} />
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
  separator: {
    height: 2,
  },
});
