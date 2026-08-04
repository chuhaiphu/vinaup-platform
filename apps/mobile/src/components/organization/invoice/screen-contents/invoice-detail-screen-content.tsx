import DeleteIcon from '@expo/material-symbols/delete.xml';
import { PERMISSION_ACTION, PERMISSION_RESOURCE } from '@vinaup-platform/permission';
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

import { EntityListSectionSkeleton } from '@/components/commons/skeletons/entity-list-section-skeleton';
import VinaupVerticalExpandArrow from '@/components/icons/vinaup-vertical-expand-arrow.native';
import { OrganizationInvoiceSummaryBar } from '@/components/organization/invoice/bars/organization-invoice-summary-bar';
import { InvoiceDetailHeader } from '@/components/organization/invoice/detail/invoice-detail-header';
import {
  ReceiptPaymentListInInvoice,
  type ReceiptPaymentListInInvoiceRef,
} from '@/components/organization/invoice/receipt-payment-list-in-invoice';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SingleSelect } from '@/components/primitives/single-select';
import { SlideSheet, SlideSheetRef } from '@/components/primitives/slide-sheet';
import {
  InvoiceStatus,
  InvoiceStatusOptions,
  InvoiceTypeDisplay,
} from '@/constants/invoice-constants';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import type { ToolbarIcon } from '@/interfaces/navigation-interfaces';
import { ReceiptPaymentListInInvoiceProvider } from '@/providers/commons/receipt-payment/receipt-payment-list-in-invoice-provider';
import { OrganizationCustomerProvider } from '@/providers/organization/customer/organization-customer-provider';
import { useInvoiceDetailContext } from '@/providers/organization/invoice/invoice-detail-provider';
import { useOrganizationAbility } from '@/providers/organization/organization-ability-provider';

export function InvoiceDetailScreenContent() {
  const {
    invoice,
    isUpdatingInvoice,
    isRefreshingInvoice,
    isDeletingInvoice,
    invoiceId,
    handleUpdateInvoice,
    handleDelete,
    refreshInvoice,
  } = useInvoiceDetailContext();
  const { can } = useOrganizationAbility();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);
  const sheetRef = useRef<SlideSheetRef>(null);
  const receiptListRef = useRef<ReceiptPaymentListInInvoiceRef>(null);
  const [isRefreshingReceiptList, setIsRefreshingReceiptList] = useState(false);
  const insets = useSafeAreaInsets();

  function handleDeleteInvoice() {
    return handleDelete(
      () => setIsNavigating(true),
      () => setIsNavigating(false),
    );
  }

  const handlePullToRefresh = useCallback(() => {
    receiptListRef.current?.refresh();
    refreshInvoice();
  }, [refreshInvoice]);

  return (
    <OrganizationCustomerProvider organizationId={invoice.organization?.id}>
      <Stack.Title>{`Chi tiết ${InvoiceTypeDisplay[invoice.type]}`}</Stack.Title>
      {can(PERMISSION_ACTION.DELETE, PERMISSION_RESOURCE.INVOICE) && (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            icon={Platform.select<ToolbarIcon>({ ios: 'trash', android: DeleteIcon })}
            accessibilityLabel="Xoá"
            disabled={isDeletingInvoice}
            onPress={handleDeleteInvoice}
          />
        </Stack.Toolbar>
      )}
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshingInvoice || isRefreshingReceiptList}
            onRefresh={handlePullToRefresh}
            colors={[COLORS.teal700]}
            tintColor={COLORS.teal700}
          />
        }
      >
        <View style={styles.actionContainer}>
          {isUpdatingInvoice || isRefreshingInvoice ? (
            <ActivityIndicator size="small" color={COLORS.teal700} />
          ) : (
            <PressableOpacity style={styles.statusFilter} onPress={() => sheetRef.current?.open()}>
              <VinaupVerticalExpandArrow width={16} height={16} />
              <Text style={{ color: COLORS.teal700 }}>
                {InvoiceStatusOptions.find((o) => o.value === invoice.status)?.label ||
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
            options={InvoiceStatusOptions}
            value={invoice.status || ''}
            onSelectOption={(val) =>
              sheetRef.current?.close(() => handleUpdateInvoice({ status: val as InvoiceStatus }))
            }
          />
          <View style={{ height: insets.bottom }} />
        </SlideSheet>
        <InvoiceDetailHeader />
        <Suspense fallback={<EntityListSectionSkeleton />}>
          <ReceiptPaymentListInInvoiceProvider
            key={`receipt-payment-list-in-invoice-${invoiceId}`}
            invoiceId={invoiceId}
          >
            <ReceiptPaymentListInInvoice
              ref={receiptListRef}
              onRefreshingChange={setIsRefreshingReceiptList}
              startDate={invoice.startDate}
              endDate={invoice.endDate}
              invoiceId={invoiceId}
              organizationId={invoice.organization?.id}
              invoiceType={invoice.type}
            />
          </ReceiptPaymentListInInvoiceProvider>
        </Suspense>
      </ScrollView>
      <Suspense fallback={null}>
        <View style={styles.summaryContainer}>
          <ReceiptPaymentListInInvoiceProvider invoiceId={invoiceId}>
            <OrganizationInvoiceSummaryBar invoice={invoice} />
          </ReceiptPaymentListInInvoiceProvider>
          <View style={{ height: insets.bottom }} />
        </View>
      </Suspense>
    </OrganizationCustomerProvider>
  );
}

const styles = StyleSheet.create({
  container: {},
  summaryContainer: {
    marginTop: SPACING.md,
  },
  actionContainer: {
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
