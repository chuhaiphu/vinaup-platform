import { Stack } from 'expo-router';
import { ApiError, initWire } from 'fetchwire';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/primitives/error-boundary';
import Loader from '@/components/primitives/loader';
import { Toast } from '@/components/primitives/toast';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { useToastStore } from '@/hooks/use-toast-store';
import { AuthProvider } from '@/providers/auth/auth-provider';
import { tokenManager } from '@/utils/class/token-manager';

initWire({
  baseUrl: process.env.EXPO_PUBLIC_API_URL || '',
  headers: {
    'x-request-platform': 'mobile',
  },
  interceptors: {
    onRequest: async () =>
      await new Promise<void>((resolve) => {
        // After 100ms, resolve the promise to allow the request to proceed
        setTimeout(() => {
          resolve();
        }, 100);
      }),
    onResponse: async (url, response) => {
      // ─── Dev-only logging, must never throw ──────────────────────────
      // Runs for EVERY response before the ok-check.
      if (!__DEV__) return;
      try {
        const body = await response.clone().text();
        console.log('API Response:', { url, status: response.status, body });
      } catch {
        console.log('API Response:', { url, status: response.status });
      }
    },
  },
  getToken: () => tokenManager.getValidAccessToken(),
  transformResponse(res) {
    const rawResponse = res as {
      statusCode?: number;
      data?: object;
      message?: string;
    };

    // ─── Guard: reject an OK response that is not this API's envelope ────────
    // Why we check `statusCode` (not `data`): a valid `void` endpoint (e.g. /auth/logout)
    // legitimately returns `{ statusCode, message }` with no `data`
    if (rawResponse.statusCode === undefined) {
      throw new ApiError('Empty server response', 'EMPTY_RESPONSE', 520);
    }

    return {
      status: rawResponse.statusCode,
      data: rawResponse.data,
      message: rawResponse.message || '',
    };
  },
  transformError: (error) => {
    const raw = error as { statusCode?: number; message?: string | string[]; error?: string };
    const message = Array.isArray(raw.message) ? raw.message[0] : raw.message;
    return new ApiError(message ?? 'Đã có lỗi xảy ra', raw.error ?? 'UNKNOWN', raw.statusCode);
  },
});
export default function RootLayout() {
  const isNavigating = useNavigationStore((s) => s.isNavigating);
  const toast = useToastStore((s) => s.toast);
  const hideToast = useToastStore((s) => s.hideToast);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView>
        <KeyboardProvider>
          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <AuthProvider>
              <StatusBar barStyle="dark-content" />
              <Stack screenOptions={{ headerShown: false }} />
            </AuthProvider>
            {isNavigating && <Loader withOverlay size={96} />}
            {toast && (
              <Toast
                key={toast.id}
                message={toast.message}
                type={toast.type}
                onDismiss={hideToast}
              />
            )}
          </SafeAreaProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
