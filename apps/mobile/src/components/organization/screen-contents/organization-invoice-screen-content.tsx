import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import { PERMISSION_ACTION, PERMISSION_RESOURCE } from '@vinaup-platform/permission';
import type { InvoiceStatus } from '@vinaup-platform/validation';
import dayjs from 'dayjs';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { prefetch } from 'fetchwire';
import { Suspense, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { getInvoiceById } from '@/apis/invoice/invoice-apis';
import { EntityListSectionSkeleton } from '@/components/commons/skeletons/entity-list-section-skeleton';
import { InvoiceListSection } from '@/components/organization/invoice/list/invoice-list-section';
import { FilterSelect } from '@/components/primitives/filter-select';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SegmentedControl, SegmentedControlItem } from '@/components/primitives/segmented-control';
import { UnifiedDatePicker } from '@/components/primitives/unified-date-picker';
import { DD_MM_YYYY_DATE_FORMAT, MM_YYYY_DATE_FORMAT } from '@/constants/app-constants';
import { type DatePickerMode } from '@/constants/date-constants';
import {
  INVOICE_TYPE,
  InvoiceStatusOptions,
  type InvoiceType,
} from '@/constants/invoice-constants';
import { COLORS, FONT_SIZES, ICON_SIZES, SPACING } from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { OrganizationInvoiceListProvider } from '@/providers/organization/invoice/organization-invoice-list-provider';
import { useOrganizationAbility } from '@/providers/organization/organization-ability-provider';
import { useOrganizationActionsContext } from '@/providers/organization/organization-actions-provider';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

const INVOICE_TYPE_ITEMS: SegmentedControlItem<InvoiceType>[] = [
  { value: INVOICE_TYPE.SELL, label: 'Thu bán hàng' },
  { value: INVOICE_TYPE.BUY, label: 'Chi mua hàng' },
];

export function OrganizationInvoiceScreenContent() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    invoiceType?: string;
    month?: string;
    day?: string;
  }>();

  const { organizationId, can } = useOrganizationAbility();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);
  const { createInvoice, isCreatingInvoice } = useOrganizationActionsContext();
  const { month, day } = params;
  const invoiceType: InvoiceType =
    params.invoiceType === INVOICE_TYPE.BUY ? INVOICE_TYPE.BUY : INVOICE_TYPE.SELL;

  const [localInvoiceType, setLocalInvoiceType] = useState<InvoiceType>(invoiceType);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('');
  const [filterMode, setFilterMode] = useState<DatePickerMode>('month');
  const [pickerVisible, setPickerVisible] = useState(false);

  const getSelectedDate = () => {
    if (day) {
      return dayjs(day, 'YYYY-MM-DD');
    } else if (month) {
      setFilterMode('month');
      return dayjs(month, 'YYYY-MM');
    } else {
      return dayjs();
    }
  };
  const selectedDate = getSelectedDate();

  const handleDateChange = (date: dayjs.Dayjs, mode: DatePickerMode) => {
    setFilterMode(mode);
    if (mode === 'month') {
      router.setParams({ month: date.format('YYYY-MM'), day: undefined });
    } else {
      router.setParams({ day: date.format('YYYY-MM-DD'), month: undefined });
    }
  };

  const suspenseKey = `org-invoice-list-${organizationId}-${invoiceType}-${filterMode}-${
    filterMode === 'month' ? selectedDate.format('YYYY-MM') : selectedDate.format('YYYY-MM-DD')
  }-${statusFilter}`;

  const handleAddNew = () => {
    createInvoice(
      { organizationId, invoiceType: localInvoiceType },
      {
        onSuccess: async (data) => {
          setIsNavigating(true);
          try {
            await prefetch(() => getInvoiceById(data?.id || ''), {
              fetchKey: `organization-invoice-${data?.id}`,
            });
          } catch {
            // Fallback to normal navigation if prefetch fails.
          }
          setIsNavigating(false);
          router.push({
            pathname: '/(protected)/invoice-detail/[invoiceId]',
            params: { invoiceId: data?.id || '' },
          });
        },
        onError: (error) =>
          Alert.alert('Lỗi', generateErrorMessage(error, 'Không thể tạo hoá đơn mới')),
      },
    );
  };

  return (
    <View style={styles.container}>
      {can(PERMISSION_ACTION.CREATE, PERMISSION_RESOURCE.INVOICE) && (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            icon={require('@/assets/images/add_new.png')}
            iconRenderingMode="original"
            disabled={isCreatingInvoice}
            accessibilityLabel="Tạo hoá đơn"
            onPress={handleAddNew}
          />
        </Stack.Toolbar>
      )}
      <View style={styles.segmentContainer}>
        <SegmentedControl
          items={INVOICE_TYPE_ITEMS}
          value={localInvoiceType}
          onChange={setLocalInvoiceType}
          onSettled={(value) => router.setParams({ invoiceType: value })}
          style={{
            pill: { backgroundColor: COLORS.white, boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)' },
            label: { fontSize: FONT_SIZES.base },
          }}
        />
      </View>
      <View style={styles.topContainer}>
        <PressableOpacity onPress={() => setPickerVisible(true)} style={styles.datePickerTrigger}>
          <FontAwesome5
            name="calendar-alt"
            size={ICON_SIZES.sm}
            color={COLORS.teal700}
            style={{ marginRight: SPACING.sm }}
          />
          <Text style={styles.dateText}>
            {filterMode === 'month'
              ? selectedDate.format(MM_YYYY_DATE_FORMAT)
              : selectedDate.format(DD_MM_YYYY_DATE_FORMAT)}
          </Text>
        </PressableOpacity>
        <FilterSelect
          placeholder="Trạng thái"
          options={InvoiceStatusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          align="right"
        />
      </View>
      <UnifiedDatePicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        value={selectedDate}
        currentMode={filterMode}
        modes={['day', 'month']}
        onChange={handleDateChange}
      />
      <Suspense fallback={<EntityListSectionSkeleton />}>
        <OrganizationInvoiceListProvider
          key={suspenseKey}
          organizationId={organizationId}
          selectedDate={selectedDate}
          statusFilter={statusFilter || undefined}
          invoiceType={invoiceType}
          filterMode={filterMode}
        >
          <InvoiceListSection
            organizationId={organizationId}
            selectedDate={selectedDate}
            statusFilter={statusFilter || undefined}
            invoiceType={invoiceType}
            filterMode={filterMode}
          />
        </OrganizationInvoiceListProvider>
      </Suspense>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  segmentContainer: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  topContainer: {
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
  },
});
