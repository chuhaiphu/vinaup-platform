import React, { ReactNode } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, ScrollView } from 'react-native';

import { COLORS } from '@/constants/style-constants';

import { PressableOpacity } from './pressable-opacity';

export interface TabsListStyles {
  list?: StyleProp<ViewStyle>;
}

export interface TabsTabStyles {
  tab?: StyleProp<ViewStyle>;
  tabTextContainer?: StyleProp<ViewStyle>;
  indicator?: StyleProp<ViewStyle>;
}

export interface TabsPanelStyles {
  panel?: StyleProp<ViewStyle>;
}

interface TabsListProps {
  children: ReactNode;
  styles?: TabsListStyles;
  gap?: number;
  // ─── scrollable=false renders a plain row instead of a horizontal ScrollView ───
  // Because a ScrollView's scroll axis is unbounded, so flex:1 children can't share its width like a View row.
  // We use scrollable false for fixed segmented controls (for tabs that should split the width via flex:1).
  scrollable?: boolean;
}

interface TabProps {
  value: string;
  currentValue?: string;
  onPress?: (value: string) => void;
  children: ReactNode;
  styles?: TabsTabStyles;
}

interface PanelProps {
  value: string;
  currentValue?: string;
  children: ReactNode;
  styles?: TabsPanelStyles;
}

const List = ({ children, styles, gap, scrollable = true }: TabsListProps) => {
  if (!scrollable) {
    return <View style={[defaultStyles.list, styles?.list, { gap }]}>{children}</View>;
  }
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[defaultStyles.list, styles?.list, { gap }]}
    >
      {children}
    </ScrollView>
  );
};

const Tab = ({ value, children, styles, currentValue, onPress }: TabProps) => {
  const isActive = currentValue === value;
  const handlePress = () => {
    if (value === currentValue) return;
    onPress?.(value);
  };
  return (
    <PressableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[defaultStyles.tab, styles?.tab]}
    >
      <View style={[defaultStyles.tabTextContainer, styles?.tabTextContainer]}>
        {children}
        {isActive && <View style={[defaultStyles.indicator, styles?.indicator]} />}
      </View>
    </PressableOpacity>
  );
};

const Panel = ({ value, currentValue, children, styles }: PanelProps) => {
  if (currentValue !== value) return null;
  return <View style={[defaultStyles.panel, styles?.panel]}>{children}</View>;
};

const Tabs = {
  List,
  Tab,
  Panel,
};

export default Tabs;

const defaultStyles = StyleSheet.create({
  list: {
    flexDirection: 'row',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.yellow400,
  },
  panel: {},
});
