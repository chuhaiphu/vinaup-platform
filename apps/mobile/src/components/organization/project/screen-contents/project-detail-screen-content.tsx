import { useRouter } from 'expo-router';
import { Suspense, useCallback, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ReceiptPaymentListInProject,
  type ReceiptPaymentListInProjectRef,
} from '@/components/commons/receipt-payment/receipt-payment-list-in-project';
import { EntityListSectionSkeleton } from '@/components/commons/skeletons/entity-list-section-skeleton';
import VinaupVerticalExpandArrow from '@/components/icons/vinaup-vertical-expand-arrow.native';
import { OrganizationProjectSummaryBar } from '@/components/organization/project/bars/organization-project-summary-bar';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SingleSelect } from '@/components/primitives/single-select';
import { SlideSheet, SlideSheetRef } from '@/components/primitives/slide-sheet';
import { ProjectStatus, ProjectStatusOptions } from '@/constants/project-constants';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { useScreenHeader } from '@/hooks/use-screen-header';
import { ReceiptPaymentListInProjectProvider } from '@/providers/commons/receipt-payment/receipt-payment-list-in-project-provider';
import { OrganizationCustomerProvider } from '@/providers/organization/customer/organization-customer-provider';
import { useProjectDetailContext } from '@/providers/organization/project/project-detail-provider';

import { ProjectDetailHeader } from '../detail/project-detail-header';

export function ProjectDetailScreenContent() {
  const {
    projectId,
    project,
    isUpdatingProject,
    isRefreshingProject,
    isDeletingProject,
    handleUpdateProject,
    handleDelete,
    refreshProject,
  } = useProjectDetailContext();
  const router = useRouter();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);
  const sheetRef = useRef<SlideSheetRef>(null);
  const receiptListRef = useRef<ReceiptPaymentListInProjectRef>(null);
  const [isRefreshingReceiptList, setIsRefreshingReceiptList] = useState(false);
  const insets = useSafeAreaInsets();

  function handleDeleteProject() {
    return handleDelete(
      () => setIsNavigating(true),
      () => setIsNavigating(false),
    );
  }

  const handleSaveAndExit = () => {
    if (!project) return;
    refreshProject();
    router.back();
  };

  const handlePullToRefresh = useCallback(() => {
    receiptListRef.current?.refresh();
    refreshProject();
  }, [refreshProject]);

  useScreenHeader({
    title: 'Chi tiết Dự án',
    onDelete: handleDeleteProject,
    isDeleting: isDeletingProject,
    onSave: handleSaveAndExit,
  });

  return (
    <OrganizationCustomerProvider organizationId={project.organization?.id}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshingProject || isRefreshingReceiptList}
            onRefresh={handlePullToRefresh}
            colors={[COLORS.teal700]}
            tintColor={COLORS.teal700}
          />
        }
      >
        <View style={styles.projectTopContainer}>
          {isUpdatingProject || isRefreshingProject ? (
            <ActivityIndicator size="small" color={COLORS.teal700} />
          ) : (
            <PressableOpacity style={styles.statusFilter} onPress={() => sheetRef.current?.open()}>
              <VinaupVerticalExpandArrow width={16} height={16} />
              <Text style={{ color: COLORS.teal700 }}>
                {ProjectStatusOptions.find((o) => o.value === project?.status)?.label ||
                  'Trạng thái'}
              </Text>
            </PressableOpacity>
          )}
        </View>
        <SlideSheet ref={sheetRef}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetHeaderTitle}>Trạng thái</Text>
          </View>
          <SingleSelect
            options={ProjectStatusOptions}
            value={project?.status || ''}
            onSelectOption={(val) =>
              sheetRef.current?.close(() => handleUpdateProject({ status: val as ProjectStatus }))
            }
          />
          <View style={{ height: insets.bottom }} />
        </SlideSheet>
        <ProjectDetailHeader />
        <Suspense fallback={<EntityListSectionSkeleton />}>
          <ReceiptPaymentListInProjectProvider
            key={`receipt-payment-list-in-project-${projectId}`}
            projectId={projectId}
          >
            <ReceiptPaymentListInProject
              ref={receiptListRef}
              projectId={projectId}
              startDate={project?.startDate || undefined}
              endDate={project?.endDate || undefined}
              onRefreshingChange={setIsRefreshingReceiptList}
            />
          </ReceiptPaymentListInProjectProvider>
        </Suspense>
      </ScrollView>
      <Suspense fallback={null}>
        <View style={styles.summaryContainer}>
          <ReceiptPaymentListInProjectProvider projectId={projectId}>
            <OrganizationProjectSummaryBar projectId={projectId} />
          </ReceiptPaymentListInProjectProvider>
          <View style={{ height: insets.bottom }} />
        </View>
      </Suspense>
    </OrganizationCustomerProvider>
  );
}

const styles = StyleSheet.create({
  container: {},
  projectTopContainer: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryContainer: {
    marginTop: SPACING.md,
  },
  statusFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sheetHeader: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray300,
    alignItems: 'center',
  },
  sheetHeaderTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal900,
  },
});
