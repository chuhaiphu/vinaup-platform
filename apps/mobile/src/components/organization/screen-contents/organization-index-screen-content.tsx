import Feather from '@react-native-vector-icons/feather/static';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { IndexUtilityGrid } from '@/components/commons/grids/index-utility-grid';
import { UtilitySelectModal } from '@/components/commons/modals/utility-select-modal/utility-select-modal';
import VinaupCog from '@/components/icons/vinaup-cog.native';
import { VinaupLogoPrimary } from '@/components/icons/vinaup-logo-primary.native';
import VinaupPlusMinus from '@/components/icons/vinaup-plus-minus.native';
import VinaupSigningPenWithFrame from '@/components/icons/vinaup-signing-pen-with-frame.native';
import { OrganizationHomeIndexSummary } from '@/components/organization/home/organization-home-index-summary';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { ORGANIZATION_UTILITY_KEYS, type OrganizationUtilityKey } from '@/constants/app-constants';
import { COLORS, FONT_SIZES, ICON_SIZES, SPACING } from '@/constants/style-constants';
import { useOrganizationUtilitiesStore } from '@/hooks/use-organization-utility-store';
import { useOrganizationHomeSummaryContext } from '@/providers/organization/organization-home-summary-provider';

export function OrganizationIndexScreenContent({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const setUtilities = useOrganizationUtilitiesStore((s) => s.setUtilities);
  const selectionsForOrg = useOrganizationUtilitiesStore((s) => s.selections[organizationId]);
  const selectedUtilities = selectionsForOrg ?? [];
  const { receiptPayments, isRefreshing, refreshAll } = useOrganizationHomeSummaryContext();

  const today = dayjs();

  const utilityOptions = [
    {
      label: 'Thu bán hàng',
      value: ORGANIZATION_UTILITY_KEYS.INVOICE_SELL,
      leftSection: (
        <View style={styles.utilityOptionIcon}>
          <VinaupPlusMinus width={22} height={22} color={COLORS.teal700} />
        </View>
      ),
    },
    {
      label: 'Chi mua hàng',
      value: ORGANIZATION_UTILITY_KEYS.INVOICE_BUY,
      leftSection: (
        <View style={styles.utilityOptionIcon}>
          <VinaupPlusMinus width={22} height={22} color={COLORS.teal700} />
        </View>
      ),
    },
    {
      label: 'Booking',
      value: ORGANIZATION_UTILITY_KEYS.BOOKING,
      leftSection: (
        <View style={styles.utilityOptionIcon}>
          <VinaupSigningPenWithFrame width={22} height={22} color={COLORS.teal700} />
        </View>
      ),
    },
  ];

  const handlePress = (key: string | 'settings') => {
    if (key === 'settings' || !organizationId) return;

    if (key === ORGANIZATION_UTILITY_KEYS.BOOKING) {
      router.navigate({
        pathname: '/(protected)/organization/[organizationId]/(tabs)/booking',
        params: { organizationId },
      });
      return;
    }

    router.navigate({
      pathname: '/(protected)/organization/[organizationId]/(tabs)/invoice',
      params: {
        organizationId,
        invoiceTypeCode: key === ORGANIZATION_UTILITY_KEYS.INVOICE_SELL ? 'SELL' : 'BUY',
      },
    });
  };

  const allUtilities = [
    {
      key: ORGANIZATION_UTILITY_KEYS.INVOICE_SELL,
      label: 'Thu bán hàng',
      icon: <VinaupPlusMinus width={28} height={28} color={COLORS.teal700} />,
    },
    {
      key: ORGANIZATION_UTILITY_KEYS.INVOICE_BUY,
      label: 'Chi mua hàng',
      icon: <VinaupPlusMinus width={28} height={28} color={COLORS.teal700} />,
    },
    {
      key: ORGANIZATION_UTILITY_KEYS.BOOKING,
      label: 'Booking',
      icon: <VinaupSigningPenWithFrame width={28} height={28} color={COLORS.teal700} />,
    },
  ];

  const visibleUtilities = allUtilities.filter((item) => selectedUtilities.includes(item.key));

  const utilitySelectRef = useRef<SlideSheetRef | null>(null);

  const handleOpen = () => {
    utilitySelectRef.current?.open();
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshAll}
            colors={[COLORS.teal700]}
            tintColor={COLORS.teal700}
          />
        }
      >
        <View style={styles.topRow}>
          <PressableOpacity style={styles.iconButton} onPress={() => handlePress('settings')}>
            <VinaupCog width={24} height={24} />
          </PressableOpacity>
        </View>

        <OrganizationHomeIndexSummary
          receiptPayments={receiptPayments}
          organizationId={organizationId}
          currentMonth={today}
        />

        <View style={styles.utilitiesRow}>
          <View style={styles.utilitiesLeft}>
            <VinaupLogoPrimary width={20} height={20} color={COLORS.gray400} />
            <Text style={styles.utilitiesText}>Tiện ích</Text>
          </View>
          <PressableOpacity onPress={handleOpen}>
            <Feather name="edit" size={ICON_SIZES.md} color={COLORS.teal700} />
          </PressableOpacity>
        </View>

        <IndexUtilityGrid items={visibleUtilities} onItemPress={handlePress} />
      </ScrollView>

      <UtilitySelectModal
        options={utilityOptions}
        values={selectedUtilities}
        onUtilitySelect={(vals) => setUtilities(organizationId, vals as OrganizationUtilityKey[])}
        utilitySelectRef={utilitySelectRef}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray100,
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  utilitiesRow: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  utilitiesLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  utilitiesText: {
    fontSize: FONT_SIZES.base,
  },
  utilityOptionIcon: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
