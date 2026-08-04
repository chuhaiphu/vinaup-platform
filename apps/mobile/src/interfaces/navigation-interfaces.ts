import type { Stack } from 'expo-router';
import type { ComponentProps } from 'react';

/**
 * What a header toolbar item can draw: an SF Symbol name on iOS, an image source on Android.
 * Needed as an explicit `Platform.select` generic, which otherwise infers from one branch only.
 */
export type ToolbarIcon = ComponentProps<typeof Stack.Toolbar.Button>['icon'];
