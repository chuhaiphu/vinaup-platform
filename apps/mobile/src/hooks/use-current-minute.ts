import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

const MINUTE_IN_MS = 60_000;

export function useCurrentMinute() {
  const [currentMinute, setCurrentMinute] = useState(() => new Date());

  useEffect(() => {
    // Store reference to the scheduled timeout so we can clear it on cleanup
    let timeoutId: ReturnType<typeof setTimeout>;

    /**
     * Updates state and schedules the next tick at :00 seconds of the next minute.
     */
    const tick = () => {
      const now = new Date();
      setCurrentMinute(now);

      // Calculate remaining milliseconds until the next :00 seconds of next minute.
      // Example: If current time is 10:05:15.200, then remainingMsUntilNextMinute = 60,000 - 15,200 = 44,800ms
      const elapsedMsInCurrentMinute = now.getSeconds() * 1000 + now.getMilliseconds();
      const remainingMsUntilNextMinute = MINUTE_IN_MS - elapsedMsInCurrentMinute;

      // Self-schedule (recursive call) to execute `tick` again at the exact top of the next minute.
      /*
       * -----------------------------------------------------------------------
       * Scenario: User opens the app at 10:05:45 (45s in, 15s left until 10:06:00)
       *
       * 🔴 RUN 1: Immediate execution when the app mounts (10:05:45)
       *    1. Updates UI state to "10:05".
       *    2. Calculates `remainingMsUntilNextMinute` = 15,000ms (15 seconds remaining).
       *    3. Schedules the NEXT execution in 15s via `setTimeout(tick, 15000)`.
       *    4. RUN 1 COMPLETES and exits the call stack immediately.
       *
       * --- ⏰ Wait 15 seconds... ---
       *
       * 🟢 RUN 2: Timer triggers at the top of the next minute (10:06:00)
       *    1. Event Loop calls `tick()` for the second time.
       *    2. Updates UI state to "10:06".
       *    3. Calculates `remainingMsUntilNextMinute` = 60,000ms (full 60 seconds).
       *    4. Schedules the NEXT execution in 60s via `setTimeout(tick, 60000)`.
       *    5. RUN 2 COMPLETES and exits the call stack.
       *
       * --- ⏰ Wait 60 seconds... ---
       *
       * 🔵 RUN 3: Next minute arrives (10:07:00)
       *    -> This creates a non-blocking "domino effect" loop, running indefinitely
       *       until the component unmounts (where `clearTimeout` breaks the chain).
       */
      timeoutId = setTimeout(tick, remainingMsUntilNextMinute);
    };

    // Phase 1: Start the clock immediately when the component mounts
    tick();

    // Phase 2: Handle AppState changes (e.g., app coming back from background)
    const subscription = AppState.addEventListener('change', (nextState) => {
      // When the app becomes active again:
      // - Timers might have paused or lost accuracy while in background.
      // - Clear any pending outdated timeout and re-sync immediately.
      if (nextState === 'active') {
        clearTimeout(timeoutId);
        tick();
      }
    });

    // Phase 3: Cleanup memory on component unmount or re-render
    return () => {
      clearTimeout(timeoutId);
      subscription.remove();
    };
  }, []); // Empty dependency array ensures setup runs only once on mount

  return currentMinute;
}
