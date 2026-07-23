import { PERMISSION_ACTION, PERMISSION_RESOURCE } from '@vinaup-platform/permission';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { prefetch } from 'fetchwire';
import React, { useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';

import { getInvoiceById } from '@/apis/invoice/invoice-apis';
import VinaupAddNew from '@/components/icons/vinaup-add-new.native';
import { Button } from '@/components/primitives/button';
import { SegmentedControl, SegmentedControlItem } from '@/components/primitives/segmented-control';
import { INVOICE_TYPE, type InvoiceType } from '@/constants/invoice-constants';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { useOrganizationAbility } from '@/providers/organization/organization-ability-provider';
import { useOrganizationActionsContext } from '@/providers/organization/organization-actions-provider';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

const INVOICE_TYPE_ITEMS: SegmentedControlItem<InvoiceType>[] = [
  { value: INVOICE_TYPE.SELL, label: 'Thu bán hàng' },
  { value: INVOICE_TYPE.BUY, label: 'Chi mua hàng' },
];

const OrganizationInvoiceHeaderBottom = () => {
  const router = useRouter();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);
  const params = useGlobalSearchParams<{
    organizationId: string;
    invoiceType?: string;
  }>();
  const currentInvoiceType: InvoiceType =
    params.invoiceType === INVOICE_TYPE.BUY ? INVOICE_TYPE.BUY : INVOICE_TYPE.SELL;

  const [localInvoiceType, setLocalInvoiceType] = useState<InvoiceType>(currentInvoiceType);

  const { can } = useOrganizationAbility();
  const { createInvoice, isCreatingInvoice: isMutating } = useOrganizationActionsContext();

  const handleAddNew = () => {
    createInvoice(
      { organizationId: params.organizationId, invoiceType: localInvoiceType },
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
  const handleInvoiceSegmentChange = (value: InvoiceType) =>
    router.setParams({ invoiceType: value });

  return (
    <View style={styles.bottomContainer}>
      <View style={styles.segmentWrapper}>
        <SegmentedControl
          items={INVOICE_TYPE_ITEMS}
          value={localInvoiceType}
          onChange={setLocalInvoiceType}
          onSettled={handleInvoiceSegmentChange}
          style={{
            pill: { backgroundColor: COLORS.white, boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)' },
            label: { fontSize: FONT_SIZES.base },
          }}
        />
      </View>
      {can(PERMISSION_ACTION.CREATE, PERMISSION_RESOURCE.INVOICE) && (
        <Button onPress={handleAddNew} isLoading={isMutating} loaderStyle={{ size: 30 }}>
          <VinaupAddNew width={30} height={30} />
        </Button>
      )}
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
