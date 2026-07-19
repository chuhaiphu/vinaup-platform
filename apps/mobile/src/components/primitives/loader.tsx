import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

interface LoaderProps {
  size?: number;
  withOverlay?: boolean;
}

export default function Loader({ size = 128, withOverlay = false }: LoaderProps) {
  if (withOverlay) {
    return (
      <View style={styles.overlay}>
        <Image
          source={{ uri: 'vinaup_loader' }}
          style={{ width: size, height: size }}
          alt="Loading..."
        />
      </View>
    );
  }
  return (
    <Image
      source={{ uri: 'vinaup_loader' }}
      style={{ width: size, height: size }}
      alt="Loading..."
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
});
