import React from 'react';
import { GestureResponderEvent, Platform, Pressable, StyleProp, ViewStyle } from 'react-native';

interface TabBarButtonProps {
  children: React.ReactNode;
  onPress?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent> | GestureResponderEvent) => void;
  onLongPress?: ((e: GestureResponderEvent) => void) | null;
  style?: StyleProp<ViewStyle>;
  accessibilityState?: { selected?: boolean };
  testID?: string;
  'aria-label'?: string;
  rippleColor?: string;
}

export function TabBarButton({
  children,
  onPress,
  onLongPress,
  style,
  accessibilityState,
  testID,
  'aria-label': ariaLabel,
  rippleColor = 'transparent',
}: TabBarButtonProps) {
  return (
    <Pressable
      aria-label={ariaLabel}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      onPress={onPress}
      onLongPress={onLongPress}
      android_ripple={{ color: rippleColor, borderless: true }}
      style={({ pressed }) => [
        style,
        pressed && Platform.OS !== 'android' ? { opacity: 0.6 } : null,
      ]}
    >
      {children}
    </Pressable>
  );
}
