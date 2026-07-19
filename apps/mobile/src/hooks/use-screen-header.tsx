import { useNavigation, useRouter } from 'expo-router';
import React, { useLayoutEffect } from 'react';

import { ScreenHeader, ScreenHeaderStyles } from '@/components/commons/headers/screen-header';

export interface UseScreenHeaderOptions {
  title: string;
  /**
   * Fully overrides the back button behavior.
   * Default: router.back(). To run a side-effect and then go back,
   * call router.back() manually inside the callback.
   */
  onBackPress?: () => void;
  backIcon?: React.ReactNode;
  hideBack?: boolean;
  onSave?: () => void;
  saveIcon?: React.ReactNode;
  isSaving?: boolean;
  onDelete?: () => void;
  deleteIcon?: React.ReactNode;
  isDeleting?: boolean;
  onAdd?: () => void;
  addIcon?: React.ReactNode;
  isAdding?: boolean;
  /**
   * Extra React node rendered directly underneath the title bar,
   * It shares the header's background, shadow, and safe area.
   */
  extension?: React.ReactNode;
  styles?: ScreenHeaderStyles;
}

/**
 * Mounts a `ScreenHeader` as the current route's navigator header via
 * `navigation.setOptions({ header })`.
 *
 * @example
 * function MyScreen() {
 *   useScreenHeader({ title: 'Details', onSave: handleSave });
 *   return <View>...body...</View>;
 * }
 */
export function useScreenHeader(options: UseScreenHeaderOptions) {
  const navigation = useNavigation();
  const router = useRouter();

  // useLayoutEffect runs synchronously after render but before the paints,
  // so navigation.setOptions is applied before the UI is visible (or before the component is committed).
  // With a plain useEffect, navigation.setOptions is applied asynchronously with the paint,
  // which causes the default header to flash with wrong position or content on screen on initial load.
  useLayoutEffect(() => {
    const handleBackPress = options.onBackPress ?? (() => router.back());
    navigation.setOptions({
      header: () => <ScreenHeader {...options} onBackPress={handleBackPress} />,
    });
  }, [navigation, router, options]);
}
