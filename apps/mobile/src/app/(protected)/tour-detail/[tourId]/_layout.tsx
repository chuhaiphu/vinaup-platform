import DeleteIcon from '@expo/material-symbols/delete.xml';
import { Slot, Stack, useLocalSearchParams, useRouter, useSegments } from 'expo-router';
import { type ApiError } from 'fetchwire';
import { useRef, Suspense } from 'react';
import { View, StyleSheet, Alert, Text, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EntityDetailSkeleton } from '@/components/commons/skeletons/entity-detail-skeleton';
import VinaupVerticalExpandArrow from '@/components/icons/vinaup-vertical-expand-arrow.native';
import { OrganizationTourDetailTabList } from '@/components/organization/tour/detail/organization-tour-detail-tab-list';
import { ErrorBoundary } from '@/components/primitives/error-boundary';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SingleSelect } from '@/components/primitives/single-select';
import { SlideSheet, SlideSheetRef } from '@/components/primitives/slide-sheet';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/style-constants';
import { TourStatus, TourStatusOptions } from '@/constants/tour-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import type { ToolbarIcon } from '@/interfaces/navigation-interfaces';
import {
  TourDetailProvider,
  useTourDetailContext,
} from '@/providers/organization/tour/tour-detail-provider';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

function TourDetailLayoutContent() {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<SlideSheetRef>(null);

  const router = useRouter();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);
  const { tourId } = useLocalSearchParams<{
    tourId: string;
  }>();
  const { tour, isRefreshingTour, isUpdatingTour, handleUpdateTour, deleteTour, isDeleting } =
    useTourDetailContext();

  const segments = useSegments();
  const tab = segments[segments.length - 1];

  const handleDelete = () => {
    if (!tourId) return;
    Alert.alert('Xác nhận', 'Bạn muốn xoá?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'OK',
        style: 'destructive',
        onPress: () => {
          setIsNavigating(true);
          deleteTour({
            onSuccess: () => {
              setIsNavigating(false);
              router.back();
            },
            onError: (error: ApiError) => {
              setIsNavigating(false);
              Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra khi xóa.'));
            },
          });
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon={Platform.select<ToolbarIcon>({ ios: 'trash', android: DeleteIcon })}
          accessibilityLabel="Xoá"
          disabled={isDeleting}
          onPress={handleDelete}
        />
      </Stack.Toolbar>
      <OrganizationTourDetailTabList currentTab={tab} tourId={tourId} />
      <View style={styles.actionContainer}>
        {isUpdatingTour || isRefreshingTour ? (
          <ActivityIndicator size="small" color={COLORS.teal700} />
        ) : (
          <PressableOpacity style={styles.statusFilter} onPress={() => sheetRef.current?.open()}>
            <VinaupVerticalExpandArrow width={16} height={16} />
            <Text style={{ color: COLORS.teal700 }}>
              {TourStatusOptions.find((o) => o.value === tour.status)?.label || 'Trạng thái'}
            </Text>
          </PressableOpacity>
        )}
      </View>
      <SlideSheet ref={sheetRef}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetHeaderTitle}>Trạng thái</Text>
        </View>
        <SingleSelect
          options={TourStatusOptions}
          value={tour.status || ''}
          onSelectOption={(val) =>
            sheetRef.current?.close(() => handleUpdateTour({ status: val as TourStatus }))
          }
        />
        <View style={{ height: insets.bottom }} />
      </SlideSheet>
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.slotContainer}>
          <Slot />
        </View>
      </View>
    </>
  );
}

export default function TourDetailLayout() {
  const { tourId } = useLocalSearchParams<{ tourId: string }>();

  return (
    <ErrorBoundary>
      <Suspense fallback={<EntityDetailSkeleton />}>
        <TourDetailProvider tourId={tourId}>
          <TourDetailLayoutContent />
        </TourDetailProvider>
      </Suspense>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actionContainer: {
    marginVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  slotContainer: {
    flex: 1,
  },
});
