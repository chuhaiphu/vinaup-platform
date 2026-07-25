import Octicons from '@react-native-vector-icons/octicons/static';
import { Tabs, useLocalSearchParams } from 'expo-router';

import { TabBarButton } from '@/components/commons/bars/tab-bar-button/tab-bar-button';
import { HomeHeader } from '@/components/commons/headers/home-header/home-header';
import VinaupCircleHorizontalHalfArrow from '@/components/icons/vinaup-circle-horizontal-half-arrow.native';
import VinaupHome from '@/components/icons/vinaup-home.native';
import VinaupLocation from '@/components/icons/vinaup-location.native';
import VinaupPlusMinusMultiplyEqual from '@/components/icons/vinaup-plus-minus-multiply-equal.native';
import VinaupPlusMinus from '@/components/icons/vinaup-plus-minus.native';
import VinaupSigningPenWithFrame from '@/components/icons/vinaup-signing-pen-with-frame.native';
import VinaupVan from '@/components/icons/vinaup-van.native';
import { COLORS, FONT_SIZES } from '@/constants/style-constants';
import { OrganizationActionsProvider } from '@/providers/organization/organization-actions-provider';

export default function OrganizationTabsLayout() {
  const params = useLocalSearchParams<{ organizationId: string }>();
  const { organizationId } = params;
  return (
    <OrganizationActionsProvider>
      <Tabs
        screenOptions={{
          header: () => <HomeHeader />,
          tabBarButton: (props) => <TabBarButton {...props} />,
          tabBarStyle: {
            backgroundColor: COLORS.blue900,
          },
          tabBarActiveTintColor: COLORS.yellow400,
          tabBarInactiveTintColor: COLORS.white,
          tabBarLabelStyle: {
            fontSize: FONT_SIZES.xxs,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <VinaupHome width={size} height={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          initialParams={{ organizationId }}
          name="invoice"
          options={{
            title: 'Hoá đơn',
            tabBarIcon: ({ color, size }) => (
              <VinaupPlusMinus width={size} height={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="project"
          initialParams={{ organizationId }}
          options={{
            title: 'Dự án',
            // Why we can't just remove this <Tabs.Screen>:
            // expo-router auto-registers every file in (tabs) as a tab, so it would reappear again as default.
            // href: null hides it from the tab bar while keeping the route navigable.
            href: null,
            tabBarIcon: ({ color, size }) => (
              <VinaupPlusMinusMultiplyEqual width={size} height={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="tour"
          initialParams={{ organizationId }}
          options={{
            title: 'Tour',
            tabBarIcon: ({ color, size }) => (
              <VinaupCircleHorizontalHalfArrow
                width={size * 1.15}
                height={size * 1.15}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="booking"
          initialParams={{ organizationId, type: 'FROM' }}
          options={{
            title: 'Booking',
            tabBarIcon: ({ color, size }) => (
              <VinaupSigningPenWithFrame width={size * 1.15} height={size * 1.15} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="car"
          initialParams={{ organizationId, carView: 'cars' }}
          options={{
            title: 'Xe',
            tabBarIcon: ({ color, size }) => <VinaupVan width={size} height={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="attendance"
          initialParams={{ organizationId }}
          options={{
            title: 'Chấm công',
            tabBarIcon: ({ color, size }) => (
              <VinaupLocation width={size} height={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Tổ chức',
            // Why we can't just remove this <Tabs.Screen>:
            // expo-router auto-registers every file in (tabs) as a tab, so it would reappear again as default.
            // href: null hides it from the tab bar while keeping the route navigable.
            href: null,
            tabBarIcon: ({ color, size }) => <Octicons name="people" size={size} color={color} />,
          }}
        />
      </Tabs>
    </OrganizationActionsProvider>
  );
}
