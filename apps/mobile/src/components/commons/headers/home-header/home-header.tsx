import Octicons from '@react-native-vector-icons/octicons/static';
import { useLocalSearchParams, usePathname } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import OrganizationNavigatorSelector from '@/components/commons/selectors/navigator-selector/organization-navigator-selector';
import PersonalNavigatorSelector from '@/components/commons/selectors/navigator-selector/personal-navigator-selector';
import { OwnerSelector } from '@/components/commons/selectors/owner-selector/owner-selector';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  HEADER_HEIGHT,
  ICON_SIZES,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';

// import PersonalIndexHeaderBottom from './personal-index-header-bottom';
// import OrganizationIndexHeaderBottom from './organization-index-header-bottom';
import OrganizationAttendanceHeaderBottom from './organization-attendance-header-bottom';
import OrganizationBookingHeaderBottom from './organization-booking-header-bottom';
import OrganizationCarHeaderBottom from './organization-car-header-bottom';
import OrganizationInvoiceHeaderBottom from './organization-invoice-header-bottom';
import OrganizationProjectHeaderBottom from './organization-project-header-bottom';
import OrganizationTourHeaderBottom from './organization-tour-header-bottom';
import PersonalCalendarHeaderBottom from './personal-calendar-header-bottom';
import PersonalProjectHeaderBottom from './personal-project-header-bottom';
import PersonalReceiptPaymentHeaderBottom from './personal-receipt-payment-header-bottom';
import PersonalWageHeaderBottom from './personal-wage-header-bottom';

export const HomeHeader = () => {
  const pathname = usePathname();
  const params = useLocalSearchParams<{ organizationId: string }>();
  const insets = useSafeAreaInsets();
  // Route is the single source of truth for the active mode
  const isOrganizationMode = !!params.organizationId;

  const renderHeaderBottom = () => {
    switch (true) {
      case pathname.includes('/personal/wage'):
        return <PersonalWageHeaderBottom />;
      case pathname.includes('/personal/project'):
        return <PersonalProjectHeaderBottom />;
      case pathname.includes('/personal/calendar'):
        return <PersonalCalendarHeaderBottom />;
      case pathname.includes('/personal/receipt-payment'):
        return <PersonalReceiptPaymentHeaderBottom />;
      case pathname === '/personal':
        // return <PersonalIndexHeaderBottom />;
        return null;
      case pathname === `/organization/${params.organizationId}/invoice`:
        return <OrganizationInvoiceHeaderBottom />;
      case pathname === `/organization/${params.organizationId}/booking`:
        return <OrganizationBookingHeaderBottom />;
      case pathname === `/organization/${params.organizationId}`:
        // return <OrganizationIndexHeaderBottom />;
        return null;
      case pathname.includes(`/organization/${params.organizationId}/tour`):
        return <OrganizationTourHeaderBottom />;
      case pathname === `/organization/${params.organizationId}/project`:
        return <OrganizationProjectHeaderBottom />;
      case pathname === `/organization/${params.organizationId}/car`:
        return <OrganizationCarHeaderBottom />;
      case pathname === `/organization/${params.organizationId}/attendance`:
        return <OrganizationAttendanceHeaderBottom />;
      default:
        return null;
    }
  };

  const headerBottom = renderHeaderBottom();

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <View style={styles.innerContainer}>
        <View style={styles.headerLeft}>
          {isOrganizationMode ? <OrganizationNavigatorSelector /> : <PersonalNavigatorSelector />}
          <OwnerSelector />
        </View>
        <View style={styles.headerRight}>
          <PressableOpacity>
            <Octicons name="bell" size={ICON_SIZES.md} color={COLORS.teal700} />
          </PressableOpacity>
        </View>
      </View>
      {headerBottom && <View style={styles.bottomRow}>{headerBottom}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  innerContainer: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
  },
  bottomRow: {
    backgroundColor: COLORS.gray100,
    marginHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.md,
    // padding: SPACING.sm,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleLeft: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.teal900,
  },
  titleRight: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  userNameText: {
    color: COLORS.teal900,
    fontSize: FONT_SIZES.lg,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
