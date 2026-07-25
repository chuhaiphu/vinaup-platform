import { fetchClient } from 'fetchwire';
import { ErrorBoundary as ReactErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  LINE_HEIGHTS,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

// React has no function-component equivalent for error boundaries,
// so we lean on the officially recommended `react-error-boundary` package
// See https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        // ─── Dev-only logging, must never throw ──────────────────────────
        // Logs the error and its component stack to console. In prod this is a no-op.
        if (!__DEV__) return;
        console.error('ErrorBoundary caught an error:', { error, info });
      }}
      onReset={
        // ─── Clear rejected promises so the retry re-fetches ─────────────
        // A Suspense fetch caches its (rejected) promise by fetchKey
        // without clearing it, remounting would replay the same failure forever.
        () => fetchClient.clear()
      }
    >
      {children}
    </ReactErrorBoundary>
  );
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đã xảy ra lỗi</Text>
      <Text style={styles.message}>{generateErrorMessage(error)}</Text>
      <Pressable style={styles.button} onPress={resetErrorBoundary} accessibilityRole="button">
        <Text style={styles.buttonText}>Thử lại</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  title: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.semibold, color: COLORS.teal900 },
  message: {
    fontSize: FONT_SIZES.sm,
    lineHeight: LINE_HEIGHTS.sm,
    textAlign: 'center',
    color: COLORS.gray700,
  },
  button: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.teal700,
  },
  buttonText: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.semibold, color: COLORS.white },
});
