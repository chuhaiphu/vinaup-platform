import FontAwesome5, {
  type FontAwesome5SolidIconName,
} from '@react-native-vector-icons/fontawesome5/static';
import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import {
  COLORS,
  FONT_SIZES,
  HEADER_HEIGHT,
  ICON_SIZES,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';
import type { ToastType } from '@/hooks/use-toast-store';

const ENTER_DURATION = 300;
const EXIT_DURATION = 250;

const DISPLAY_DURATION = 4000;

const HIDDEN_OFFSET_Y = -SPACING.lg;

const iconByType: Record<ToastType, FontAwesome5SolidIconName> = {
  success: 'check-circle',
  error: 'exclamation-circle',
  info: 'info-circle',
};

interface ToastProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
}

export function Toast({ message, type, onDismiss }: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(HIDDEN_OFFSET_Y);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // ─── Step 1: Enter animation ─────────────────────────────────────
    translateY.value = withTiming(0, { duration: ENTER_DURATION });
    opacity.value = withTiming(1, { duration: ENTER_DURATION });

    // ─── Step 2: Auto-dismiss after display duration ──────────────────
    // translateY callback triggers onDismiss on the JS thread via scheduleOnRN
    const timer = setTimeout(() => {
      translateY.value = withTiming(HIDDEN_OFFSET_Y, { duration: EXIT_DURATION }, (finished) => {
        if (finished) scheduleOnRN(onDismiss);
      });
      opacity.value = withTiming(0, { duration: EXIT_DURATION });
    }, DISPLAY_DURATION);

    return () => clearTimeout(timer);
  }, [onDismiss, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        styles[type],
        { top: insets.top + HEADER_HEIGHT + SPACING.sm },
        animatedStyle,
      ]}
    >
      <FontAwesome5
        iconStyle="solid"
        name={iconByType[type]}
        size={ICON_SIZES.sm}
        color={COLORS.white}
      />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  success: { backgroundColor: COLORS.teal700 },
  error: { backgroundColor: COLORS.red600 },
  info: { backgroundColor: COLORS.gray700 },
  message: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
    color: COLORS.white,
  },
});
