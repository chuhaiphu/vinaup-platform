import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { prefetch } from 'fetchwire';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { getProjectById } from '@/apis/project/project-apis';
import { ProjectCard } from '@/components/commons/cards/project-card';
import { PersonalProjectSummaryBar } from '@/components/personal/project/bars/personal-project-summary-bar';
import { type DatePickerMode } from '@/constants/date-constants';
import { COLORS } from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { ProjectResponse } from '@/interfaces/project-interfaces';
import { usePersonalProjectListContext } from '@/providers/personal/project/personal-project-list-provider';
import { calculateReceiptPaymentsSummary } from '@/utils/calculator/calculate-receipt-payments-summary';

export interface PersonalProjectListSectionProps {
  selectedDate: dayjs.Dayjs;
  statusFilter: string;
  categoryId?: string;
  filterMode: DatePickerMode;
}

export function PersonalProjectListSection(_props: PersonalProjectListSectionProps) {
  const router = useRouter();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);
  const { projectList, receiptPayments, refreshFetch, isRefreshing } =
    usePersonalProjectListContext();

  const navigateToDetail = async (project: ProjectResponse) => {
    setIsNavigating(true);
    const fetchKey = project.organizationId
      ? `organization-project-${project.id}`
      : `personal-project-${project.id}`;
    try {
      await prefetch(() => getProjectById(project.id), { fetchKey });
    } catch {
      // Fallback to normal navigation if prefetch fails.
    }
    router.push({
      pathname: '/(protected)/project-detail/[projectId]',
      params: {
        projectId: project.id,
        organizationId: project.organizationId ?? undefined,
      },
    });
    setIsNavigating(false);
  };

  return (
    <View style={styles.listContainer}>
      <FlatList
        data={projectList}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const projectRPs = receiptPayments.filter((rp) => rp.projectId === item.id);
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
      <PersonalProjectSummaryBar projects={projectList} />
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
