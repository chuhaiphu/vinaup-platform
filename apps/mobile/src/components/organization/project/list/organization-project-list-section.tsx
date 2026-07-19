import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { prefetch } from 'fetchwire';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { getProjectById } from '@/apis/project/project-apis';
import { ProjectCard } from '@/components/commons/cards/project-card';
import { OrganizationProjectSummaryBar } from '@/components/organization/project/bars/organization-project-summary-bar';
import { type DatePickerMode } from '@/constants/date-constants';
import { COLORS } from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { ProjectResponse } from '@/interfaces/project-interfaces';
import { useOrganizationProjectListContext } from '@/providers/organization/project/organization-project-list-provider';
import { calculateReceiptPaymentsSummary } from '@/utils/calculator/calculate-receipt-payments-summary';

export interface OrganizationProjectListSectionProps {
  organizationId: string;
  selectedDate: dayjs.Dayjs;
  statusFilter: string;
  filterMode: DatePickerMode;
}

export function OrganizationProjectListSection({
  organizationId,
}: OrganizationProjectListSectionProps) {
  const router = useRouter();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);
  const { projects, allReceiptPayments, refreshFetch, isRefreshing } =
    useOrganizationProjectListContext();

  const navigateToDetail = async (project: ProjectResponse) => {
    setIsNavigating(true);
    try {
      await prefetch(() => getProjectById(project.id), {
        fetchKey: `organization-project-${project.id}`,
      });
    } catch {
      // Fallback to normal navigation if prefetch fails.
    }

    router.push({
      pathname: '/(protected)/project-detail/[projectId]',
      params: {
        projectId: project.id,
        organizationId: organizationId,
      },
    });
    setIsNavigating(false);
  };

  return (
    <View style={styles.listContainer}>
      <FlatList
        data={projects}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const projectRPs = allReceiptPayments.filter((rp) => rp.projectId === item.id);
          const { totalRemaining } = calculateReceiptPaymentsSummary(projectRPs);
          return (
            <ProjectCard
              project={item}
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
      <OrganizationProjectSummaryBar projects={projects} />
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
