import Octicons from '@react-native-vector-icons/octicons/static';
import React from 'react';
import { Image, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { COLORS } from '@/constants/style-constants';

interface AvatarProps {
  imgSrc?: string | null;
  size?: number;
  // if radius is 'full', it will be a circle
  // if it's a number, it will be the border radius in pixels
  radius?: number | 'full';
  icon?: React.ReactNode;
  style?: {
    container?: StyleProp<ViewStyle>;
  };
}

export function Avatar({ imgSrc, size = 32, radius = 'full', icon, style }: AvatarProps) {
  const containerRadius = radius === 'full' ? size / 2 : radius;
  const imageRadius = Math.max(containerRadius - 2, 0);

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: containerRadius },
        style?.container,
      ]}
    >
      {imgSrc ? (
        <Image
          source={{ uri: imgSrc }}
          style={{
            width: size - 4,
            height: size - 4,
            borderRadius: imageRadius,
          }}
          resizeMode="cover"
        />
      ) : icon ? (
        icon
      ) : (
        <Octicons name="person" size={size * 0.6} color={COLORS.teal700} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: COLORS.teal700,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray100,
  },
});
