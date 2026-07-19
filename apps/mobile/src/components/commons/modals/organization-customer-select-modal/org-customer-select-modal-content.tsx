import Feather from '@react-native-vector-icons/feather/static';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import React, { useImperativeHandle, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { CreateOrganizationCustomerModal } from '@/components/commons/modals/create-organization-customer-modal/create-organization-customer-modal';
import { Button } from '@/components/primitives/button';
import { ConfirmSlideSheetContentRef } from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import Tabs from '@/components/primitives/tabs';
import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ICON_SIZES,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';
import { OrganizationCustomerResponse } from '@/interfaces/organization-customer-interfaces';
import { OrganizationResponse } from '@/interfaces/organization-interfaces';
import { useAllOrganizationsContext } from '@/providers/auth/all-organizations-provider';
import { useOrganizationCustomerContext } from '@/providers/organization/customer/organization-customer-provider';

import { OrgCustomerInternalList } from './org-customer-internal-list';
import { OrgCustomerRealList } from './org-customer-real-list';

type TabValue = 'real' | 'internal';

type CurrentSelection =
  { type: 'real'; organizationId: string } | { type: 'internal'; customerId: string } | null;

interface OrgCustomerSelectModalContentProps {
  organizationId: string;
  currentOrganizationCustomerId: string;
  isBusy: boolean;
  onConfirm: (payload: { organizationCustomerId: string | null }, callback: () => void) => void;
  onRequestClose: () => void;
  ref?: React.RefObject<ConfirmSlideSheetContentRef | null>;
}

export function OrgCustomerSelectModalContent({
  organizationId,
  currentOrganizationCustomerId,
  isBusy,
  onConfirm,
  onRequestClose,
  ref,
}: OrgCustomerSelectModalContentProps) {
  const { organizationCustomers, refreshOrganizationCustomers, createOrganizationCustomer } =
    useOrganizationCustomerContext();
  const { allOrganizations } = useAllOrganizationsContext();

  const createCustomerModalRef = useRef<SlideSheetRef | null>(null);

  const createOrgCustomer = (
    org: OrganizationResponse,
    callbacks?: Parameters<typeof createOrganizationCustomer>[1],
  ) =>
    createOrganizationCustomer(
      {
        organizationId: organizationId!,
        name: org.name,
        phone: org.phone,
        email: org.email || undefined,
        status: 'ACTIVE',
        joinedAt: new Date().toISOString(),
        clientOrganizationId: org.id,
      },
      callbacks,
    );

  const currentCustomer = organizationCustomers.find(
    (customer) => customer.id === currentOrganizationCustomerId,
  );

  // Map the currently-saved customer to the option that should appear pre-selected.
  const getCurrentSelection = (
    customer: OrganizationCustomerResponse | undefined,
  ): CurrentSelection => {
    if (!customer) return null;
    if (customer.clientOrganizationId) {
      return { type: 'real', organizationId: customer.clientOrganizationId };
    }
    return { type: 'internal', customerId: customer.id };
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState<TabValue>(() =>
    currentCustomer?.clientOrganizationId ? 'real' : 'internal',
  );
  const [currentSelection, setCurrentSelection] = useState<CurrentSelection>(() =>
    getCurrentSelection(currentCustomer),
  );

  // ─── Re-sync only when the source customer changes after mount (e.g. data loads late) ─────
  // Why set-during-render instead of an effect (react-hooks/set-state-in-effect):
  // React applies this re-render before committing to the DOM, avoiding an extra paint.
  const selectionKey = `${currentCustomer?.id ?? ''}:${currentCustomer?.clientOrganizationId ?? ''}`;
  const [prevSelectionKey, setPrevSelectionKey] = useState(selectionKey);
  if (selectionKey !== prevSelectionKey) {
    setPrevSelectionKey(selectionKey);
    setCurrentSelection(getCurrentSelection(currentCustomer));
    setCurrentTab(currentCustomer?.clientOrganizationId ? 'real' : 'internal');
  }

  const realOrganizationCustomers = (() => {
    const mapping = new Map<string, OrganizationCustomerResponse>();
    organizationCustomers.forEach((customer) => {
      if (customer.clientOrganizationId) {
        mapping.set(customer.clientOrganizationId, customer);
      }
    });
    return mapping;
  })();

  const q = searchQuery.trim().toLowerCase();
  const internalOrganizationCustomers = organizationCustomers.filter(
    (customer) => customer.clientOrganizationId == null,
  );
  const filteredInternalOrgCustomers = !q
    ? internalOrganizationCustomers
    : internalOrganizationCustomers.filter((customer) => {
        const searchableValue = [customer.name, customer.phone, customer.email]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return searchableValue.includes(q);
      });

  const organizations = (() => {
    const organizationsExceptOwner = allOrganizations.filter((org) => org.id !== organizationId);
    if (!q) return organizationsExceptOwner;
    return organizationsExceptOwner.filter((organization) => {
      const searchableValue = [
        organization.name,
        organization.phone,
        organization.email,
        organization.province,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchableValue.includes(q);
    });
  })();

  const handleChooseInternal = (customerId: string) => {
    if (currentSelection?.type === 'internal' && currentSelection.customerId === customerId) {
      setCurrentSelection(null);
      return;
    }
    setCurrentSelection({ type: 'internal', customerId });
  };

  const handleChooseReal = (organizationIdValue: string) => {
    if (
      currentSelection?.type === 'real' &&
      currentSelection.organizationId === organizationIdValue
    ) {
      setCurrentSelection(null);
      return;
    }
    setCurrentSelection({ type: 'real', organizationId: organizationIdValue });
  };

  const handleConfirm = () => {
    if (currentSelection === null) {
      onConfirm({ organizationCustomerId: null }, onRequestClose);
      return;
    }

    if (currentSelection.type === 'internal') {
      onConfirm({ organizationCustomerId: currentSelection.customerId }, onRequestClose);
      return;
    }

    // currentSelection.type === 'real'
    const selectedOrg = organizations.find((o) => o.id === currentSelection.organizationId);

    if (!selectedOrg) {
      onConfirm({ organizationCustomerId: null }, onRequestClose);
      return;
    }

    const existingCustomer = realOrganizationCustomers.get(selectedOrg.id);
    if (existingCustomer) {
      onConfirm({ organizationCustomerId: existingCustomer.id }, onRequestClose);
      return;
    }

    createOrgCustomer(selectedOrg, {
      onSuccess: (created) => {
        refreshOrganizationCustomers();
        if (created) {
          onConfirm({ organizationCustomerId: created.id }, onRequestClose);
        }
      },
      onError: () => {
        Alert.alert('Lỗi', 'Không thể liên kết tổ chức cộng đồng.');
      },
    });
  };

  useImperativeHandle(ref, () => ({ submit: handleConfirm }));

  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Khách hàng</Text>
        {currentTab === 'internal' ? (
          <Button
            onPress={() => createCustomerModalRef.current?.open()}
            style={styles.addIconButton}
            disabled={isBusy}
            hitSlop={8}
          >
            <Feather
              name="user-plus"
              size={ICON_SIZES.lg}
              color={isBusy ? COLORS.gray400 : COLORS.teal700}
            />
          </Button>
        ) : null}
      </View>

      <Tabs.List styles={{ list: styles.tabList }}>
        <Tabs.Tab
          value="real"
          currentValue={currentTab}
          onPress={(value) => setCurrentTab(value as TabValue)}
          styles={{
            tab: styles.tab,
            tabTextContainer: styles.tabTextContainer,
          }}
        >
          <Text style={[styles.tabText, currentTab === 'real' && styles.activeTabText]}>
            Tổ chức cộng đồng
          </Text>
        </Tabs.Tab>
        <Tabs.Tab
          value="internal"
          currentValue={currentTab}
          onPress={(value) => setCurrentTab(value as TabValue)}
          styles={{
            tab: styles.tab,
            tabTextContainer: styles.tabTextContainer,
          }}
        >
          <Text style={[styles.tabText, currentTab === 'internal' && styles.activeTabText]}>
            Nội bộ tổ chức
          </Text>
        </Tabs.Tab>
      </Tabs.List>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={ICON_SIZES.md} color={COLORS.teal700} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Tên hoặc số điện thoại"
          placeholderTextColor={COLORS.gray400}
          style={styles.searchInput}
          editable={!isBusy}
        />
        {isBusy ? <ActivityIndicator size="small" color={COLORS.teal700} /> : null}
      </View>

      {currentTab === 'real' ? (
        <OrgCustomerRealList
          organizations={organizations}
          selectedId={currentSelection?.type === 'real' ? currentSelection.organizationId : ''}
          isBusy={isBusy}
          onChooseCustomer={handleChooseReal}
        />
      ) : (
        <OrgCustomerInternalList
          customers={filteredInternalOrgCustomers}
          selectedId={currentSelection?.type === 'internal' ? currentSelection.customerId : ''}
          isBusy={isBusy}
          onChooseCustomer={handleChooseInternal}
        />
      )}

      <CreateOrganizationCustomerModal
        organizationId={organizationId}
        modalRef={createCustomerModalRef}
        onCreated={(created) => {
          refreshOrganizationCustomers();
          setCurrentTab('internal');
          setCurrentSelection({ type: 'internal', customerId: created.id });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.teal900,
  },
  addIconButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabList: {
    flex: 1,
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
  },
  tabTextContainer: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  tabText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray400,
  },
  activeTabText: {
    color: COLORS.teal700,
    fontWeight: FONT_WEIGHTS.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
    paddingVertical: 0,
  },
});
