import DeleteIcon from '@expo/material-symbols/delete.xml';
import { Stack } from 'expo-router';
import { Suspense, useCallback, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ReceiptPaymentListInWage,
  type ReceiptPaymentListInWageRef,
} from '@/components/commons/receipt-payment/receipt-payment-list-in-wage';
import { EntityListSectionSkeleton } from '@/components/commons/skeletons/entity-list-section-skeleton';
import VinaupVerticalExpandArrow from '@/components/icons/vinaup-vertical-expand-arrow.native';
import { PersonalWageSummaryBar } from '@/components/personal/wage/bars/personal-wage-summary-bar';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SingleSelect } from '@/components/primitives/single-select';
import { SlideSheet, SlideSheetRef } from '@/components/primitives/slide-sheet';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/style-constants';
import { WageStatus, WageStatusOptions } from '@/constants/wage-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import type { ToolbarIcon } from '@/interfaces/navigation-interfaces';
import { ReceiptPaymentListInWageProvider } from '@/providers/commons/receipt-payment/receipt-payment-list-in-wage-provider';
import { usePersonalWageDetailContext } from '@/providers/personal/wage/personal-wage-detail-provider';

import { PersonalWageDetailHeader } from '../detail/personal-wage-detail-header';

export function PersonalWageDetailScreenContent() {
  const {
    wageId,
    wage,
    isUpdatingWage,
    isRefreshingWage,
    isDeletingWage,
    handleUpdateWage,
    handleDelete,
    refreshWage,
  } = usePersonalWageDetailContext();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);
  const sheetRef = useRef<SlideSheetRef>(null);
  const receiptListRef = useRef<ReceiptPaymentListInWageRef>(null);
  const [isRefreshingReceiptList, setIsRefreshingReceiptList] = useState(false);
  const insets = useSafeAreaInsets();

  function handleDeleteWage() {
    return handleDelete(
      () => setIsNavigating(true),
      () => setIsNavigating(false),
    );
  }

  const handlePullToRefresh = useCallback(() => {
    receiptListRef.current?.refresh();
    refreshWage();
  }, [refreshWage]);

  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon={Platform.select<ToolbarIcon>({ ios: 'trash', android: DeleteIcon })}
          accessibilityLabel="Xoá"
          disabled={isDeletingWage}
          onPress={handleDeleteWage}
        />
      </Stack.Toolbar>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshingWage || isRefreshingReceiptList}
            onRefresh={handlePullToRefresh}
            colors={[COLORS.teal700]}
            tintColor={COLORS.teal700}
          />
        }
      >
        <View style={styles.topContainer}>
          {isUpdatingWage || isRefreshingWage ? (
            <ActivityIndicator size="small" color={COLORS.teal700} />
          ) : (
            <PressableOpacity style={styles.statusFilter} onPress={() => sheetRef.current?.open()}>
              <VinaupVerticalExpandArrow width={16} height={16} />
              <Text style={{ color: COLORS.teal700 }}>
                {WageStatusOptions.find((o) => o.value === wage.status)?.label || 'Trạng thái'}
              </Text>
            </PressableOpacity>
          )}
        </View>
        <SlideSheet ref={sheetRef}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetHeaderTitle}>Trạng thái</Text>
          </View>
          <SingleSelect
            options={WageStatusOptions}
            value={wage?.status || ''}
            onSelectOption={(val) =>
              sheetRef.current?.close(() => handleUpdateWage({ status: val as WageStatus }))
            }
          />
          <View style={{ height: insets.bottom }} />
        </SlideSheet>
        <PersonalWageDetailHeader
          wage={wage}
          isLoading={isUpdatingWage || isRefreshingWage}
          onConfirm={(data, onSuccessCallback) => handleUpdateWage(data, onSuccessCallback)}
        />
        <Suspense fallback={<EntityListSectionSkeleton />}>
          <ReceiptPaymentListInWageProvider
            key={`receipt-payment-list-in-wage-${wageId}`}
            wageId={wageId}
          >
            <ReceiptPaymentListInWage
              ref={receiptListRef}
              wageId={wageId}
              startDate={wage.startDate}
              endDate={wage.endDate}
              onRefreshingChange={setIsRefreshingReceiptList}
            />
          </ReceiptPaymentListInWageProvider>
        </Suspense>
      </ScrollView>
      <Suspense fallback={null}>
        <View style={{ marginTop: SPACING.md }}>
          <ReceiptPaymentListInWageProvider wageId={wageId}>
            <PersonalWageSummaryBar wageId={wageId} />
          </ReceiptPaymentListInWageProvider>
          <View style={{ height: insets.bottom }} />
        </View>
      </Suspense>
    </>
  );
}

const styles = StyleSheet.create({
  container: {},
  topContainer: {
    paddingVertical: SPACING.md,
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
});
