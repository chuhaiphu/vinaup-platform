import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import type { InvoiceStatus } from '@vinaup-platform/validation';
import dayjs from 'dayjs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Suspense, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { EntityListSectionSkeleton } from '@/components/commons/skeletons/entity-list-section-skeleton';
import { InvoiceListSection } from '@/components/organization/invoice/list/invoice-list-section';
import { FilterSelect } from '@/components/primitives/filter-select';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { UnifiedDatePicker } from '@/components/primitives/unified-date-picker';
import { DD_MM_YYYY_DATE_FORMAT, MM_YYYY_DATE_FORMAT } from '@/constants/app-constants';
import { type DatePickerMode } from '@/constants/date-constants';
import { InvoiceStatusOptions } from '@/constants/invoice-constants';
import { COLORS, FONT_SIZES, ICON_SIZES, SPACING } from '@/constants/style-constants';
import { OrganizationInvoiceListProvider } from '@/providers/organization/invoice/organization-invoice-list-provider';

export function OrganizationInvoiceScreenContent() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    organizationId: string;
    invoiceTypeCode: string;
    month?: string;
    day?: string;
  }>();

  const { organizationId, month, day } = params;
  const invoiceTypeCode = params.invoiceTypeCode || 'SELL';

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

  const suspenseKey = `org-invoice-list-${organizationId}-${invoiceTypeCode}-${filterMode}-${
    filterMode === 'month' ? selectedDate.format('YYYY-MM') : selectedDate.format('YYYY-MM-DD')
  }-${statusFilter}`;

  return (
    <View style={styles.container}>
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
          invoiceTypeCode={invoiceTypeCode}
          filterMode={filterMode}
        >
          <InvoiceListSection
            organizationId={organizationId}
            selectedDate={selectedDate}
            statusFilter={statusFilter || undefined}
            invoiceTypeCode={invoiceTypeCode}
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
