import { useRouter } from 'expo-router';
import { Suspense, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EntityListSectionSkeleton } from '@/components/commons/skeletons/entity-list-section-skeleton';
import VinaupVerticalExpandArrow from '@/components/icons/vinaup-vertical-expand-arrow.native';
import {
  TripAssignmentSection,
  TripAssignmentSectionRef,
} from '@/components/organization/trip/detail/trip-assignment-section';
import { TripContentSection } from '@/components/organization/trip/detail/trip-content-section';
import {
  TripCostSection,
  TripCostSectionRef,
} from '@/components/organization/trip/detail/trip-cost-section';
import { TripDetailHeader } from '@/components/organization/trip/detail/trip-detail-header';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SingleSelect } from '@/components/primitives/single-select';
import { SlideSheet, SlideSheetRef } from '@/components/primitives/slide-sheet';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/style-constants';
import { TripStatus, TripStatusOptions } from '@/constants/trip-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { useScreenHeader } from '@/hooks/use-screen-header';
import { ReceiptPaymentListInTripProvider } from '@/providers/commons/receipt-payment/receipt-payment-list-in-trip-provider';
import { OrganizationCustomerProvider } from '@/providers/organization/customer/organization-customer-provider';
import { TripAssignmentListProvider } from '@/providers/organization/trip/trip-assignment-list-provider';
import { useTripDetailContext } from '@/providers/organization/trip/trip-detail-provider';

const TRIP_STATUS_SELECT_OPTIONS = TripStatusOptions.filter((option) => option.value !== '');

export function TripDetailScreenContent() {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<SlideSheetRef>(null);
  const assignmentSectionRef = useRef<TripAssignmentSectionRef>(null);
  const tripCostRef = useRef<TripCostSectionRef>(null);
  const router = useRouter();

  const {
    trip,
    isRefreshingTrip,
    isUpdatingTrip,
    isDeletingTrip,
    tripId,
    handleUpdateTrip,
    handleDelete,
    refreshTrip,
  } = useTripDetailContext();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);

  function handleDeleteTrip() {
    return handleDelete(
      () => setIsNavigating(true),
      () => setIsNavigating(false),
    );
  }

  const handleRefresh = () => {
    refreshTrip();
    assignmentSectionRef.current?.refresh();
    tripCostRef.current?.refresh();
  };

  const handleSaveAndExit = () => {
    refreshTrip();
    router.back();
  };

  useScreenHeader({
    title: 'Chi tiết chuyến',
    onDelete: handleDeleteTrip,
    onSave: handleSaveAndExit,
    isDeleting: isDeletingTrip,
  });

  return (
    <OrganizationCustomerProvider organizationId={trip.organization?.id}>
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.actionContainer}>
          {isUpdatingTrip || isRefreshingTrip ? (
            <ActivityIndicator size="small" color={COLORS.teal700} />
          ) : (
            <PressableOpacity style={styles.statusFilter} onPress={() => sheetRef.current?.open()}>
              <VinaupVerticalExpandArrow width={16} height={16} />
              <Text style={styles.statusFilterText}>
                {TripStatusOptions.find((option) => option.value === trip.status)?.label ||
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
            options={TRIP_STATUS_SELECT_OPTIONS}
            value={trip.status || ''}
            onSelectOption={(val) =>
              sheetRef.current?.close(() => handleUpdateTrip({ status: val as TripStatus }))
            }
          />
          <View style={{ height: insets.bottom }} />
        </SlideSheet>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshingTrip}
              onRefresh={handleRefresh}
              colors={[COLORS.teal700]}
              tintColor={COLORS.teal700}
            />
          }
        >
          <TripDetailHeader />
          <TripContentSection />
          <Suspense fallback={<EntityListSectionSkeleton />}>
            <ReceiptPaymentListInTripProvider
              key={`receipt-payment-list-in-trip-${tripId}`}
              tripId={tripId}
            >
              <TripCostSection ref={tripCostRef} />
            </ReceiptPaymentListInTripProvider>
          </Suspense>
          <Suspense fallback={<EntityListSectionSkeleton />}>
            <TripAssignmentListProvider
              key={`organization-trip-assignment-list-${tripId}`}
              tripId={tripId}
            >
              <TripAssignmentSection
                ref={assignmentSectionRef}
                organizationId={trip.organization?.id}
              />
            </TripAssignmentListProvider>
          </Suspense>
        </ScrollView>
      </View>
    </OrganizationCustomerProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  actionContainer: {
    marginVertical: SPACING.md,
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
  statusFilterText: {
    color: COLORS.teal700,
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
