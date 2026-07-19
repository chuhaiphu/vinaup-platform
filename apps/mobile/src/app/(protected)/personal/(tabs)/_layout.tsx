import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import Octicons from '@react-native-vector-icons/octicons/static';
import { Tabs } from 'expo-router';

import { TabBarButton } from '@/components/commons/bars/tab-bar-button/tab-bar-button';
import { HomeHeader } from '@/components/commons/headers/home-header/home-header';
import VinaupCalendarIcon from '@/components/icons/vinaup-calendar-icon';
import VinaupHome from '@/components/icons/vinaup-home.native';
import VinaupPlusMinusMultiplyEqual from '@/components/icons/vinaup-plus-minus-multiply-equal.native';
import { COLORS, FONT_SIZES } from '@/constants/style-constants';
import { PersonalActionsProvider } from '@/providers/personal/personal-actions-provider';

export default function PersonalTabsLayout() {
  return (
    <PersonalActionsProvider>
      <Tabs
        screenOptions={{
          header: () => <HomeHeader />,
          tabBarButton: (props) => <TabBarButton {...props} />,
          tabBarActiveTintColor: COLORS.yellow400,
          tabBarInactiveTintColor: COLORS.teal700,
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
            title: 'Tiền công',
            tabBarIcon: ({ color, size }) => (
              <VinaupCalendarIcon width={size} height={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="project"
          options={{
            title: 'Dự án',
            tabBarIcon: ({ color, size }) => (
              <VinaupPlusMinusMultiplyEqual width={size} height={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: 'Lịch',
            tabBarIcon: ({ color, size }) => (
              <FontAwesome5 name="calendar-alt" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Cá nhân',
            tabBarIcon: ({ color, size }) => <Octicons name="person" size={size} color={color} />,
          }}
        />
      </Tabs>
    </PersonalActionsProvider>
  );
}
