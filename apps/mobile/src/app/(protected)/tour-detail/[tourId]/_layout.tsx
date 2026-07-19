import Entypo from '@react-native-vector-icons/entypo/static';
import FontAwesome from '@react-native-vector-icons/fontawesome/static';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { Slot, useLocalSearchParams, useRouter, useSegments } from 'expo-router';
import { type ApiError } from 'fetchwire';
import { useRef, Suspense } from 'react';
import { View, StyleSheet, Alert, Text, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EntityDetailSkeleton } from '@/components/commons/skeletons/entity-detail-skeleton';
import VinaupSaveAndExit from '@/components/icons/vinaup-save-and-exit.native';
import VinaupVerticalExpandArrow from '@/components/icons/vinaup-vertical-expand-arrow.native';
import { OrganizationTourDetailTabList } from '@/components/organization/tour/detail/organization-tour-detail-tab-list';
import { ErrorBoundary } from '@/components/primitives/error-boundary';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SingleSelect } from '@/components/primitives/single-select';
import { SlideSheet, SlideSheetRef } from '@/components/primitives/slide-sheet';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, ICON_SIZES, SPACING } from '@/constants/style-constants';
import { TourStatus, TourStatusOptions } from '@/constants/tour-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { useScreenHeader } from '@/hooks/use-screen-header';
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
  const {
    tour,
    isRefreshingTour,
    isUpdatingTour,
    handleUpdateTour,
    refreshTour,
    deleteTour,
    isDeleting,
  } = useTourDetailContext();

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

  const handleSaveAndExit = () => {
    refreshTour();
    router.back();
  };

  useScreenHeader({
    title: 'Quản lý Tour',
    backIcon: <Ionicons name="chevron-back" size={ICON_SIZES.lg} color={COLORS.teal700} />,
    deleteIcon: <FontAwesome name="trash-o" size={ICON_SIZES.md} color={COLORS.teal700} />,
    saveIcon: <VinaupSaveAndExit width={32} height={24} color={COLORS.teal700} />,
    onDelete: handleDelete,
    isDeleting,
    onSave: handleSaveAndExit,
    styles: {
      container: styles.headerContainer,
      title: styles.headerTitle,
    },
    extension: <OrganizationTourDetailTabList currentTab={tab} tourId={tourId} />,
  });

  return (
    <>
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
        <View style={styles.actionButton}>
          <PressableOpacity style={styles.actionButtonItem}>
            <FontAwesome5 name="copy" size={ICON_SIZES.md} color={COLORS.teal700} />
          </PressableOpacity>
          <PressableOpacity style={styles.actionButtonItem}>
            <Entypo name="dots-three-horizontal" size={ICON_SIZES.md} color={COLORS.teal700} />
          </PressableOpacity>
        </View>
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
  actionButton: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionButtonItem: {},
  actionButtonItemText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal700,
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
  headerContainer: {
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
  },
  headerBackButtonIcon: {
    color: COLORS.teal700,
  },
  headerDeleteButtonIcon: {
    color: COLORS.teal700,
  },
  slotContainer: {
    flex: 1,
  },
});
