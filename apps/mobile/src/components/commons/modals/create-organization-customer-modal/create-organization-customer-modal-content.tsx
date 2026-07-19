import React, { useImperativeHandle, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { ConfirmSlideSheetContentRef } from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/style-constants';
import { OrganizationCustomerResponse } from '@/interfaces/organization-customer-interfaces';
import { useOrganizationCustomerContext } from '@/providers/organization/customer/organization-customer-provider';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

interface CreateOrganizationCustomerModalContentProps {
  organizationId?: string;
  onCreated?: (customer: OrganizationCustomerResponse) => void;
  ref?: React.RefObject<ConfirmSlideSheetContentRef | null>;
}

export function CreateOrganizationCustomerModalContent({
  organizationId,
  onCreated,
  ref,
}: CreateOrganizationCustomerModalContentProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{
    name?: boolean;
    phone?: boolean;
    email?: boolean;
  }>({});

  const { createOrganizationCustomer } = useOrganizationCustomerContext();

  const validateField = (field: keyof typeof errors, value: string) => {
    const trimmed = value.trim();
    switch (field) {
      case 'name':
        return !trimmed;
      case 'phone':
        return !/^0\d{8,10}$/.test(trimmed);
      case 'email':
        return trimmed !== '' && !/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(trimmed);
      default:
        return false;
    }
  };

  const validateAll = () => {
    const newErrors: typeof errors = {};
    if (validateField('name', name)) newErrors.name = true;
    if (validateField('phone', phone)) newErrors.phone = true;
    if (validateField('email', email)) newErrors.email = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!organizationId) {
      Alert.alert('Lỗi', 'Thiếu thông tin tổ chức.');
      return;
    }

    if (!validateAll()) return;

    createOrganizationCustomer(
      {
        organizationId: organizationId!,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().length > 0 ? email.trim() : undefined,
        status: 'ACTIVE',
        joinedAt: new Date().toISOString(),
      },
      {
        onSuccess: (created) => {
          if (created) {
            onCreated?.(created);
          }
          setName('');
          setPhone('');
          setEmail('');
          setErrors({});
        },
        onError: (error) => {
          Alert.alert(
            'Lỗi',
            generateErrorMessage(error, 'Có lỗi xảy ra khi tạo khách hàng tổ chức.'),
          );
        },
      },
    );
  };

  useImperativeHandle(ref, () => ({ submit: handleSubmit }));

  return (
    <View>
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Tên</Text>
          <Text style={styles.requiredMark}>*</Text>
        </View>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={name}
          onChangeText={(val) => {
            setName(val);
            setErrors((prev) => ({
              ...prev,
              name: validateField('name', val),
            }));
          }}
          placeholder="Nguyễn Văn A"
          placeholderTextColor={COLORS.gray400}
        />
        {errors.name && <Text style={styles.errorText}>Vui lòng nhập tên khách hàng.</Text>}
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Điện thoại</Text>
          <Text style={styles.requiredMark}>*</Text>
        </View>
        <TextInput
          style={[styles.input, errors.phone && styles.inputError]}
          value={phone}
          onChangeText={(val) => {
            setPhone(val);
            setErrors((prev) => ({
              ...prev,
              phone: validateField('phone', val),
            }));
          }}
          placeholder="0xxxxxxxxx"
          keyboardType="phone-pad"
          placeholderTextColor={COLORS.gray400}
        />
        {errors.phone && <Text style={styles.errorText}>Số điện thoại không hợp lệ.</Text>}
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Email</Text>
        </View>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          value={email}
          onChangeText={(val) => {
            setEmail(val);
            setErrors((prev) => ({
              ...prev,
              email: validateField('email', val),
            }));
          }}
          placeholder="email@gmail.com"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={COLORS.gray400}
        />
        {errors.email && <Text style={styles.errorText}>Email không hợp lệ.</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
  },
  requiredMark: {
    fontSize: FONT_SIZES.base,
    color: COLORS.red600,
    marginLeft: SPACING.xs,
  },
  input: {
    borderWidth: 0.5,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.base,
    backgroundColor: '#FBFBFB',
  },
  inputError: {
    borderColor: COLORS.red600,
  },
  errorText: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZES.xs,
    color: COLORS.red600,
  },
});
