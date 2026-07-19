import { useRouter } from 'expo-router';
import { Text, View, Button, StyleSheet } from 'react-native';

import { FONT_SIZES, SPACING } from '@/constants/style-constants';
import { useAuthContext } from '@/providers/auth/auth-provider';

export function PersonalProfileScreenContent() {
  const { performLogout } = useAuthContext();
  const router = useRouter();

  const handleLogout = () => {
    performLogout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Personal Profile</Text>
      <Button title="Đăng xuất" onPress={handleLogout} color="#ff4444" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xl,
    marginBottom: SPACING.xl,
  },
});
