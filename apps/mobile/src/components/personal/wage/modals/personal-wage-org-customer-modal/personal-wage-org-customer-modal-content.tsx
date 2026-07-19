import { useImperativeHandle, useState } from 'react';
import { View } from 'react-native';

import { ConfirmSlideSheetContentRef } from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { FlatTextInput } from '@/components/primitives/flat-text-input';

interface PersonalWageOrgCustomerModalContentProps {
  organizationName?: string | null;
  customerName?: string | null;
  isLoading?: boolean;
  onSubmit?: (data: {
    externalOrganizationName?: string | null;
    externalCustomerName?: string | null;
  }) => void;
  ref?: React.RefObject<ConfirmSlideSheetContentRef | null>;
}

export function PersonalWageOrgCustomerModalContent({
  organizationName = '',
  customerName = '',
  isLoading = false,
  onSubmit,
  ref,
}: PersonalWageOrgCustomerModalContentProps) {
  const [orgName, setOrgName] = useState(organizationName ?? '');
  const [custName, setCustName] = useState(customerName ?? '');

  const handleConfirm = () => {
    onSubmit?.({
      externalOrganizationName: orgName.trim() || null,
      externalCustomerName: custName.trim() || null,
    });
  };

  useImperativeHandle(ref, () => ({ submit: handleConfirm }));

  return (
    <View>
      <FlatTextInput
        label="Tổ chức"
        value={orgName}
        onChangeText={setOrgName}
        placeholder="..."
        editable={!isLoading}
      />
      <FlatTextInput
        label="Khách hàng"
        value={custName}
        onChangeText={setCustName}
        placeholder="..."
        editable={!isLoading}
      />
    </View>
  );
}
