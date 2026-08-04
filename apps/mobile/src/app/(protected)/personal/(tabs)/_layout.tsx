import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import Octicons from '@react-native-vector-icons/octicons/static';
import { Tabs } from 'expo-router';

import { TabBarButton } from '@/components/commons/bars/tab-bar-button/tab-bar-button';
import VinaupCalendarIcon from '@/components/icons/vinaup-calendar-icon';
import VinaupHome from '@/components/icons/vinaup-home.native';
import VinaupPlusMinusMultiplyEqual from '@/components/icons/vinaup-plus-minus-multiply-equal.native';
import { SCREEN_TITLES } from '@/constants/app-constants';
import { COLORS, FONT_SIZES } from '@/constants/style-constants';
import { PersonalActionsProvider } from '@/providers/personal/personal-actions-provider';

export default function PersonalTabsLayout() {
  return (
    <PersonalActionsProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarButton: (props) => <TabBarButton {...props} />,
          tabBarActiveTintColor: COLORS.yellow400,
          tabBarInactiveTintColor: COLORS.teal700,
          tabBarLabelStyle: {
            fontSize: FONT_SIZES.xxs,
          },
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            title: SCREEN_TITLES.PERSONAL_HOME,
            tabBarIcon: ({ color, size }) => (
              <VinaupHome width={size} height={size} color={color} />
            ),
          }}
        />
        {/* <Tabs.Screen
        name="receipt-payment"
        options={{
          tabBarIcon: ({ color, size }) => (
            <VinaupPlusMinus width={size} height={size} color={color} />
          ),
        }}
      /> */}
        <Tabs.Screen
          name="wage"
          options={{
            title: SCREEN_TITLES.PERSONAL_WAGE,
            tabBarIcon: ({ color, size }) => (
              <VinaupCalendarIcon width={size} height={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="project"
          options={{
            title: SCREEN_TITLES.PERSONAL_PROJECT,
            tabBarIcon: ({ color, size }) => (
              <VinaupPlusMinusMultiplyEqual width={size} height={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: SCREEN_TITLES.PERSONAL_CALENDAR,
            tabBarIcon: ({ color, size }) => (
              <FontAwesome5 name="calendar-alt" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: SCREEN_TITLES.PERSONAL_PROFILE,
            tabBarIcon: ({ color, size }) => <Octicons name="person" size={size} color={color} />,
          }}
        />
      </Tabs>
    </PersonalActionsProvider>
  );
}
