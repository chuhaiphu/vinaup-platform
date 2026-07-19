import Ionicons from '@react-native-vector-icons/ionicons/static';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SingleSelect, SingleSelectOption } from '@/components/primitives/single-select';
import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ICON_SIZES,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';
import { OrganizationResponse } from '@/interfaces/organization-interfaces';

interface OrgCustomerRealListProps {
  organizations: OrganizationResponse[];
  selectedId: string;
  isBusy: boolean;
  onChooseCustomer: (organizationId: string) => void;
}

export function OrgCustomerRealList({
  organizations,
  selectedId,
  isBusy,
  onChooseCustomer,
}: OrgCustomerRealListProps) {
  const options: SingleSelectOption[] = organizations.map((org) => ({
    value: org.id,
    label: org.name,
  }));

  if (organizations.length === 0) {
    return <Text style={styles.emptyText}>Không có tổ chức phù hợp.</Text>;
  }

  return (
    <SingleSelect
      options={options}
      value={selectedId}
      onSelectOption={onChooseCustomer}
      renderOption={(option, isSelected, select) => {
        const org = organizations.find((o) => o.id === option.value)!;
        return (
          <Pressable
            style={({ pressed }) => [
              styles.optionRow,
              (pressed || isSelected) && styles.optionRowActive,
            ]}
            onPress={select}
            disabled={isBusy}
          >
            <View style={styles.leadingAvatar}>
              <Ionicons name="business-outline" size={ICON_SIZES.md} color={COLORS.teal700} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.optionLabel} numberOfLines={1}>
                {org.name}
              </Text>
              <Text style={styles.optionSubLabel} numberOfLines={1}>
                {[org.phone, org.province].filter(Boolean).join(' - ') ||
                  'Không có thông tin liên hệ'}
              </Text>
            </View>
            <Ionicons
              name={isSelected ? 'radio-button-on-sharp' : 'radio-button-off-sharp'}
              size={ICON_SIZES.lg}
              color={isSelected ? COLORS.teal700 : COLORS.gray300}
            />
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  optionRow: {
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING['2xs'],
    minHeight: 60,
  },
  optionRowActive: {
    backgroundColor: '#F2FBFA',
  },
  leadingAvatar: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: SPACING['2xs'],
    flexWrap: 'wrap',
  },
  optionLabel: {
    width: '100%',
    fontSize: FONT_SIZES.base,
    color: COLORS.teal700,
    fontWeight: FONT_WEIGHTS.medium,
  },
  optionSubLabel: {
    width: '100%',
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal900,
  },
  emptyText: {
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
  },
});
