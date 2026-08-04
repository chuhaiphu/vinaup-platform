import { Stack } from 'expo-router';

import { SCREEN_TITLES, STACK_SCREEN_OPTIONS } from '@/constants/app-constants';

export default function OrganizationBookingStackLayout() {
  return (
    <Stack screenOptions={STACK_SCREEN_OPTIONS}>
      <Stack.Screen name="index" options={{ title: SCREEN_TITLES.ORGANIZATION_BOOKING }} />
    </Stack>
  );
}
