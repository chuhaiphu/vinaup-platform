import Feather from '@react-native-vector-icons/feather/static';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { IndexUtilityGrid } from '@/components/commons/grids/index-utility-grid';
import { UtilitySelectModal } from '@/components/commons/modals/utility-select-modal/utility-select-modal';
import VinaupCalendarIcon from '@/components/icons/vinaup-calendar-icon';
import VinaupCog from '@/components/icons/vinaup-cog.native';
import { VinaupLogoPrimary } from '@/components/icons/vinaup-logo-primary.native';
import VinaupPlusMinusMultiplyEqual from '@/components/icons/vinaup-plus-minus-multiply-equal.native';
import { PersonalHomeIndexSummary } from '@/components/personal/home/personal-home-index-summary';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { PERSONAL_UTILITY_KEYS, type PersonalUtilityKey } from '@/constants/app-constants';
import { COLORS, FONT_SIZES, ICON_SIZES, SPACING } from '@/constants/style-constants';
import { usePersonalUtilitiesStore } from '@/hooks/use-personal-utility-store';
import { usePersonalHomeSummaryContext } from '@/providers/personal/personal-home-summary-provider';

export function PersonalIndexScreenContent() {
  const router = useRouter();
  const selectedUtilities = usePersonalUtilitiesStore((s) => s.selectedUtilities);
  const setUtilities = usePersonalUtilitiesStore((s) => s.setUtilities);
  const {
    projects,
    wages,
    receiptPaymentsInWages,
    isRefreshingProjects,
    isRefreshingWages,
    isRefreshingReceiptPayments,
    refreshAll: onRefresh,
  } = usePersonalHomeSummaryContext();

  const thisMonth = dayjs();

  const utilityOptions = [
    {
      label: 'Thu chi Dự án',
      value: PERSONAL_UTILITY_KEYS.PROJECT,
      leftSection: (
        <View style={styles.utilityOptionIcon}>
          <VinaupPlusMinusMultiplyEqual width={22} height={22} color={COLORS.teal700} />
        </View>
      ),
    },
    {
      label: 'Tiền công',
      value: PERSONAL_UTILITY_KEYS.WAGE,
      leftSection: (
        <View style={styles.utilityOptionIcon}>
          <VinaupCalendarIcon width={22} height={22} color={COLORS.teal700} />
        </View>
      ),
    },
    {
      label: 'Lịch cá nhân',
      value: PERSONAL_UTILITY_KEYS.CALENDAR,
      leftSection: (
        <View style={styles.utilityOptionIcon}>
          <FontAwesome5 name="calendar-alt" size={ICON_SIZES.lg} color={COLORS.teal700} />
        </View>
      ),
    },
  ];

  const handlePress = (key: string) => {
    if (key === PERSONAL_UTILITY_KEYS.PROJECT) {
      router.navigate({ pathname: '/(protected)/personal/(tabs)/project' });
      return;
    }
    if (key === PERSONAL_UTILITY_KEYS.WAGE) {
      router.navigate({ pathname: '/(protected)/personal/(tabs)/wage' });
      return;
    }
    if (key === PERSONAL_UTILITY_KEYS.CALENDAR) {
      router.navigate({ pathname: '/(protected)/personal/(tabs)/calendar' });
      return;
    }
  };

  const isRefreshing = isRefreshingProjects || isRefreshingWages || isRefreshingReceiptPayments;

  const allUtilities = [
    {
      key: PERSONAL_UTILITY_KEYS.WAGE,
      label: 'Tiền công',
      value: `(${wages?.length || 0})`,
      icon: <VinaupCalendarIcon width={24} height={24} color={COLORS.teal700} />,
    },
    {
      key: PERSONAL_UTILITY_KEYS.PROJECT,
      label: 'Thu chi Dự án',
      value: `(${projects?.length || 0})`,
      icon: <VinaupPlusMinusMultiplyEqual width={24} height={24} color={COLORS.teal700} />,
    },
    {
      key: PERSONAL_UTILITY_KEYS.CALENDAR,
      label: 'Lịch cá nhân',
      icon: <FontAwesome5 name="calendar-alt" size={ICON_SIZES.lg} color={COLORS.teal700} />,
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
            onRefresh={onRefresh}
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

        <PersonalHomeIndexSummary
          receiptPayments={receiptPaymentsInWages}
          currentMonth={thisMonth}
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
        onUtilitySelect={(values) => setUtilities(values as PersonalUtilityKey[])}
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
  dateText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal700,
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
