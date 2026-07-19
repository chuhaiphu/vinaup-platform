import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

/**
 * Tracks whether the on-screen keyboard is currently visible.
 *
 * @returns `{ isKeyboardShow }` - `true` while the keyboard is on screen, `false` otherwise.
 *
 * @example
 * const { isKeyboardShow } = useKeyboardVisibility();
 */
export function useKeyboardVisibility() {
  const [isKeyboardShow, setIsKeyboardShow] = useState(false);

  // ─── Subscribe to native keyboard events ─────
  // Why: keyboard visibility is owned by the OS, not React; the only way to know is to listen.
  // The cleanup removes both listeners so we don't leak subscriptions when the screen unmounts.
  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardShow(true);
    });

    const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardShow(false);
    });

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  return { isKeyboardShow };
}
