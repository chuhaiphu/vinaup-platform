import React, { useEffect, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/style-constants';

export interface SegmentedControlItem<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  items: SegmentedControlItem<T>[];
  value: T;
  onChange: (value: T) => void;
  // ─── Fires only when the animation has finished ────
  // This onSettled prop let the parent handle the heavy computation and rendering only after the animation is done,
  // so the UI thread won't be blocked by the heavy work while it's trying to run the animation, preventing stutters.
  onSettled?: (value: T) => void;
  style?: {
    track?: StyleProp<ViewStyle>;
    pill?: StyleProp<ViewStyle>;
    segment?: StyleProp<ViewStyle>;
    label?: StyleProp<TextStyle>;
    activeLabel?: StyleProp<TextStyle>;
  };
}

const ANIMATION_DURATION = 350;
export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
  onSettled,
  style,
}: SegmentedControlProps<T>) {
  const [rowWidth, setRowWidth] = useState(0);
  const translateX = useSharedValue(0);

  const currentIndex = items.findIndex((item) => item.value === value);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  // ─── Step: derive the pill width from the MEASURED content row, not the track ─────
  const segmentWidth = items.length > 0 ? rowWidth / items.length : 0;

  // ─── Why onSettled is held in a ref instead of being an useEffect dependency ────
  // `onSettled` is an "Effect Event": it describes WHAT to do when the animation settles,
  // not WHEN the animation should re-run.
  //
  // Consumers of SegmentedControl often pass an inline `onSettled`
  // (e.g. a closure like `(v) => router.setParams(...)`) that gets a NEW reference on every render.
  // If `onSettled` were in the dependency array, the effect would re-run on every parent render,
  // which can create an infinite feedback loop:
  // effect fires onSettled -> parent updates state -> re-render -> new onSettled ref -> effect re-runs -> ...
  //
  // Holding it in a ref gives the worklet below a STABLE object to capture, decoupled from the effect deps.
  const onSettleRef = useRef(onSettled);

  // ─── Why we intentionally do NOT re-sync (`onSettleRef.current = onSettled`) on every render ────
  // The withTiming completion callback below is a worklet (runs on the UI thread).
  // Because worklets serializes the ref to the UI thread and freezes the JS-side original,
  // A re-sync (`onSettleRef.current = onSettled`) would then get a warning and would be ignored anyway
  // — the worklet only ever sees the function captured at serialization time, so re-syncing does nothing here.
  // Trade-off: `onSettled` is pinned to its first-render closure. That is safe because the settled
  // `value` is passed as an explicit argument (and `value` is in the deps below), so the callback
  // always receives the current value — only other vars captured in the closure body could go stale.

  useEffect(() => {
    const target = activeIndex * segmentWidth;

    // rapid taps interrupt the animation (finished=false), so skipped taps never trigger the heavy work.
    translateX.value = withTiming(
      target,
      { duration: ANIMATION_DURATION, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished && onSettleRef.current) {
          scheduleOnRN(onSettleRef.current, value);
        }
      },
    );
  }, [activeIndex, segmentWidth, translateX, value]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleRowLayout = (event: LayoutChangeEvent) => {
    setRowWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={[styles.track, style?.track]}>
      <View style={styles.row} onLayout={handleRowLayout}>
        {/* pillStyle stays last so the animated transform can't be overridden by style?.pill */}
        <Animated.View style={[styles.pill, { width: segmentWidth }, style?.pill, pillStyle]} />

        {items.map((item) => {
          const isActive = item.value === value;
          return (
            <Pressable
              key={item.value}
              style={[styles.segment, style?.segment]}
              onPress={() => {
                if (item.value !== value) onChange(item.value);
              }}
            >
              <Text
                style={[
                  styles.label,
                  isActive && styles.activeLabel,
                  style?.label,
                  isActive && style?.activeLabel,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray150,
    padding: SPACING.xs,
    borderRadius: RADIUS.md,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: RADIUS.sm,
  },
  segment: {
    flex: 1,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
  },
  activeLabel: {
    color: COLORS.teal700,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
