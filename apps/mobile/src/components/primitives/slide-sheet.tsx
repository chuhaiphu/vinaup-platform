import { useEffect, useImperativeHandle, useState } from 'react';
import { AppState, Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { SPACING } from '@/constants/style-constants';

export interface SlideSheetRef {
  // ─── Imperative per-call callbacks ─────
  // We pass these as an ARGUMENT each time we call open()/close().
  // • When it fires : ONLY when open()/close() is called by ref,
  //                   right after THIS ref call's animation ends.
  //                   Closing via backdrop or a Cancel button does NOT run it.
  //
  // Use when the follow-up is tied to ONE specific action and/or needs that action's data
  // (e.g. "navigate to the item the user just picked, after the sheet has closed").
  open: (onImperativeOpenCompleted?: () => void) => void;
  close: (onImperativeCloseCompleted?: () => void) => void;
}

interface SlideSheetProps {
  // ─── Declarative lifecycle callbacks ─────
  // We register these as props on the component.
  // • When it fires : EVERYTIME the Sheet is opened or closed, no matter how it was triggered,
  //                     right after the animation ends — same moment as the imperative callbacks above.
  //
  // Use for a side-effect that must run on EVERY dismissal regardless of cause:
  // typically cleanup/reset (e.g. clear the selected id)
  // or a side-effect owned by the sheet's own content (e.g. focus an input after open).
  onCloseCompleted?: () => void;
  onOpenCompleted?: () => void;
  heightPercentage?: number;
  children: React.ReactNode;
  ref?: React.RefObject<SlideSheetRef | null>;
}

export function SlideSheet({
  onCloseCompleted,
  onOpenCompleted,
  heightPercentage,
  children,
  ref,
}: SlideSheetProps) {
  const [modalVisible, setModalVisible] = useState(false);
  // ─── Children lifecycle: auto-reset on every open ─────
  // The SlideSheet itself stays mounted the whole time.
  // But for `children`, it is unmounted after the close animation finishes,
  // so any state living *inside* children is destroyed on close.
  const [shouldMountChildren, setShouldMountChildren] = useState(false);
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const sheetHeight = heightPercentage ? screenHeight * heightPercentage : undefined;
  const animationDistance = sheetHeight || screenHeight;

  // useSharedValue return ALIVE value on UI Thread that JS Thread do not care about.
  // So when changing values from useSharedValue, React DONOT re-render.
  const sheetTranslateY = useSharedValue(animationDistance);

  const isSettled = useSharedValue(false);

  // useReanimatedKeyboardAnimation return a value of the keyboard height on UI Thread, frame by frame.
  // So when keyboard moves, the sheet follows it WITHOUT React re-render.
  // no manual Keyboard.addListener needed.
  const { height: keyboardHeight } = useReanimatedKeyboardAnimation();

  // We cannot put a useSharedValue `.value` directly into a plain Stylesheet:
  //   1. Reading `.value` in JSX runs ONCE on the JS thread at render time,
  //      it captures only a snapshot (a plain number), not a live binding.
  //   2. A shared value lives on the UI thread and does NOT trigger a React re-render when it changes.
  //      So React never re-reads it → the snapshot stays frozen → no animation.
  //
  // * useAnimatedStyle solves this:
  // - it registers a worklet on the UI thread that updates the native view on every shared-value change,
  // without a React re-render.
  // * to make animation and make it smooth, we control `.value` change with methods like withTiming, etc.
  const animatedStyle = useAnimatedStyle(() => {
    // keyboard-controller `height` is NEGATIVE when keyboard open, so abs() it back to a positive distance.
    const keyboardOffset = Math.abs(keyboardHeight.get());

    return {
      height: sheetHeight,
      maxHeight: screenHeight - insets.top - keyboardOffset,
      // slide the sheet up & down
      transform: [{ translateY: sheetTranslateY.get() }],
      // slide the sheet up even more when keyboard appear
      marginBottom: keyboardOffset,
      paddingBottom: SPACING.lg,
    };
  });

  const handleClose = (onImperativeCloseCompleted?: () => void) => {
    isSettled.set(false);
    sheetTranslateY.set(
      withTiming(animationDistance, { duration: 200 }, (finished) => {
        if (finished) {
          scheduleOnRN(setModalVisible, false);
          // keep the children mounted during the closing animation, only unmount them after the animation is complete
          scheduleOnRN(setShouldMountChildren, false);
          if (onCloseCompleted) scheduleOnRN(onCloseCompleted);
          if (onImperativeCloseCompleted) scheduleOnRN(onImperativeCloseCompleted);
        }
      }),
    );
  };

  const handleOpen = (onImperativeOpenCompleted?: () => void) => {
    isSettled.set(false);
    setModalVisible(true);
    setShouldMountChildren(true);
    sheetTranslateY.set(animationDistance);
    sheetTranslateY.set(
      withTiming(0, { duration: 350 }, (finished) => {
        if (finished) {
          isSettled.set(true);
          if (onOpenCompleted) scheduleOnRN(onOpenCompleted);
          if (onImperativeOpenCompleted) scheduleOnRN(onImperativeOpenCompleted);
        }
      }),
    );
  };

  useImperativeHandle(ref, () => ({
    open: handleOpen,
    close: handleClose,
  }));

  // ─── Re-assert the style after the app returns to the foreground ─────
  //
  // React and the screen hold two DIFFERENT positions for this sheet, by design:
  // - Reanimated writes the style straight to the native view on the UI thread,
  // - React commits a style snapshot taken at the Animated.View's first render and never refreshed again.
  //
  // with animationDistance = 812:
  //   1. open()     sheetTranslateY = 812, then withTiming(0) starts.
  //                 <Modal> renders null while hidden, so Animated.View does not exist yet.
  //   2. commit     Animated.View mounts and snapshots the value as it stands right now: 812.
  //   3. 0→350ms    the animation walks the native view 812 → 0. The snapshot stays 812.
  //   4. open       screen = 0 (right), the style React committed = 812 (off-screen).
  //
  // Then an OS surface — the location permission prompt, camera, a picker — takes over the screen.
  // They live on Android's separate Activity (Android's unit of "one interactive screen"),
  // drawn on top of ours, so Android pulls out of the foreground and hands it back once that screen closes.
  // That is exactly the round trip as AppState 'background' → 'active' (iOS: 'inactive' → 'active').
  //
  // In that hand-back the native view is re-synced from React's committed style and jumps back to 812,
  // which cause the sheet vanishes while the backdrop stays put.
  //
  useEffect(() => {
    if (!modalVisible) return;

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState !== 'active') return;

      // withTiming runs it re-runs the worklet every frame, so the native view is already correct.
      // !isSettled.get() prevent modify() to cancels the animation running on it,
      // which will cause calls onOpenCompleted never runs — the sheet stops mid-slide.
      if (!isSettled.get()) return;

      // Reanimated will not update the UI if assign an unchanged value.
      // After sheet appear, sheetTranslateY is already 0. set(0) and withTiming(0) will assign value 0,
      // which will not cause the UI to update.
      // modify() is the only setter that skips that check with the curent '0' value.
      sheetTranslateY.modify();
    });

    return () => subscription.remove();
  }, [modalVisible, isSettled, sheetTranslateY]);

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => handleClose()}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={() => handleClose()} />
        <Animated.View style={[styles.sheetContent, animatedStyle]}>
          {shouldMountChildren ? children : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    width: '100%',
    overflow: 'hidden',
  },
});
