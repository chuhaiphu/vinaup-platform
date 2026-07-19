import React from 'react';
import { Pressable, PressableProps } from 'react-native';

interface PressableOpacityProps extends PressableProps {
  activeOpacity?: number;
}

export function PressableOpacity({
  children,
  style,
  activeOpacity = 0.6,
  ...props
}: PressableOpacityProps) {
  return (
    <Pressable
      {...props}
      style={(state) => [
        // Below is the type of PressableProps.style, which can be an object or a function
        // style?: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);
        // So we need to check the style prop passing to PressableOpacity,
        // if it's a function, we call it with the state, otherwise we use it directly
        typeof style === 'function' ? style(state) : style,
        { opacity: state.pressed ? activeOpacity : 1 },
      ]}
    >
      {children}
    </Pressable>
  );
}
