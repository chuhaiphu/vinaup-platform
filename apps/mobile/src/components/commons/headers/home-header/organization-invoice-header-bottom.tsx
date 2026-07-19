import { useRouter, useGlobalSearchParams } from 'expo-router';
import { prefetch } from 'fetchwire';
import React, { useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';

import { getInvoiceById } from '@/apis/invoice/invoice-apis';
import VinaupAddNew from '@/components/icons/vinaup-add-new.native';
import { Button } from '@/components/primitives/button';
import { SegmentedControl, SegmentedControlItem } from '@/components/primitives/segmented-control';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { useInvoiceTypeContext } from '@/providers/organization/invoice/invoice-type-provider';
import { useOrganizationActionsContext } from '@/providers/organization/organization-actions-provider';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

type InvoiceTypeCode = 'SELL' | 'BUY';

const INVOICE_TYPE_ITEMS: SegmentedControlItem<InvoiceTypeCode>[] = [
  { value: 'SELL', label: 'Thu bán hàng' },
  { value: 'BUY', label: 'Chi mua hàng' },
];

const OrganizationInvoiceHeaderBottom = () => {
  const router = useRouter();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);
  const params = useGlobalSearchParams<{
    organizationId: string;
    invoiceTypeCode?: string;
  }>();
  const currentCode: InvoiceTypeCode = params.invoiceTypeCode === 'BUY' ? 'BUY' : 'SELL';

  const [localCode, setLocalCode] = useState<InvoiceTypeCode>(currentCode);

  const { getInvoiceTypeByCode } = useInvoiceTypeContext();
  const { createInvoice, isCreatingInvoice: isMutating } = useOrganizationActionsContext();

  const handleAddNew = () => {
    const invoiceType = getInvoiceTypeByCode(localCode);
    if (!invoiceType) {
      Alert.alert('Lỗi', 'Không tìm thấy loại hoá đơn');
      return;
    }
    createInvoice(
      { organizationId: params.organizationId, invoiceTypeCode: localCode },
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
  const handleInvoiceSegmentChange = (value: InvoiceTypeCode) =>
    router.setParams({ invoiceTypeCode: value });

  return (
    <View style={styles.bottomContainer}>
      <View style={styles.segmentWrapper}>
        <SegmentedControl
          items={INVOICE_TYPE_ITEMS}
          value={localCode}
          onChange={setLocalCode}
          onSettled={handleInvoiceSegmentChange}
          style={{
            pill: { backgroundColor: COLORS.white, boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)' },
            label: { fontSize: FONT_SIZES.base },
          }}
        />
      </View>
      <Button onPress={handleAddNew} isLoading={isMutating} loaderStyle={{ size: 30 }}>
        <VinaupAddNew width={30} height={30} />
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomContainer: {
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  segmentWrapper: {
    flex: 1,
  },
});

export default OrganizationInvoiceHeaderBottom;
