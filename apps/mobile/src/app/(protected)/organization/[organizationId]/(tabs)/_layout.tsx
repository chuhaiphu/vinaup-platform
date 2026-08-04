import Octicons from '@react-native-vector-icons/octicons/static';
import { Tabs } from 'expo-router';

import { TabBarButton } from '@/components/commons/bars/tab-bar-button/tab-bar-button';
import VinaupCheckIn from '@/components/icons/vinaup-check-in.native';
import VinaupCircleHorizontalHalfArrow from '@/components/icons/vinaup-circle-horizontal-half-arrow.native';
import VinaupHome from '@/components/icons/vinaup-home.native';
import VinaupPlusMinusMultiplyEqual from '@/components/icons/vinaup-plus-minus-multiply-equal.native';
import VinaupPlusMinus from '@/components/icons/vinaup-plus-minus.native';
import VinaupSigningPenWithFrame from '@/components/icons/vinaup-signing-pen-with-frame.native';
import VinaupVan from '@/components/icons/vinaup-van.native';
import { SCREEN_TITLES } from '@/constants/app-constants';
import { COLORS, FONT_SIZES } from '@/constants/style-constants';
import { OrganizationActionsProvider } from '@/providers/organization/organization-actions-provider';

export default function OrganizationTabsLayout() {
  return (
    <OrganizationActionsProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
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
          name="(home)"
          options={{
            title: SCREEN_TITLES.ORGANIZATION_HOME,
            tabBarIcon: ({ color, size }) => (
              <VinaupHome width={size} height={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="invoice"
          options={{
            title: SCREEN_TITLES.ORGANIZATION_INVOICE,
            tabBarIcon: ({ color, size }) => (
              <VinaupPlusMinus width={size} height={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="project"
          options={{
            title: SCREEN_TITLES.ORGANIZATION_PROJECT,
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
          options={{
            title: SCREEN_TITLES.ORGANIZATION_TOUR,
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
          options={{
            title: SCREEN_TITLES.ORGANIZATION_BOOKING,
            tabBarIcon: ({ color, size }) => (
              <VinaupSigningPenWithFrame width={size * 1.15} height={size * 1.15} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="car"
          options={{
            title: SCREEN_TITLES.ORGANIZATION_CAR,
            tabBarIcon: ({ color, size }) => <VinaupVan width={size} height={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="attendance"
          options={{
            title: SCREEN_TITLES.ORGANIZATION_ATTENDANCE,
            tabBarIcon: ({ color, size }) => (
              <VinaupCheckIn width={size} height={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: SCREEN_TITLES.ORGANIZATION_PROFILE,
            tabBarIcon: ({ color, size }) => <Octicons name="people" size={size} color={color} />,
          }}
        />
      </Tabs>
    </OrganizationActionsProvider>
  );
}
