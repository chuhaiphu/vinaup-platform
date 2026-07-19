import { useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import Tabs from '@/components/primitives/tabs';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/style-constants';

interface OrganizationTourDetailTabListProps {
  currentTab: string;
  tourId: string;
}

export const OrganizationTourDetailTabList = ({
  tourId,
  currentTab,
}: OrganizationTourDetailTabListProps) => {
  const router = useRouter();

  const handleTabChange = (value: string) => {
    router.replace(`/(protected)/tour-detail/${tourId}/${value}`);
  };

  const tabItems = [
    { value: 'tour-calculation', label: 'Tính giá' },
    { value: 'tour-implementation', label: 'Điều hành tour' },
    { value: 'tour-settlement', label: 'Quyết toán' },
  ];

  return (
    <Tabs.List
      styles={{
        list: styles.tabList,
      }}
    >
      {tabItems.map((item) => (
        <Tabs.Tab
          key={item.value}
          value={item.value}
          currentValue={currentTab}
          onPress={handleTabChange}
          styles={{
            tab: styles.tab,
            tabTextContainer: styles.tabTextContainer,
            indicator: styles.indicator,
          }}
        >
          <Text style={[styles.tabText, currentTab === item.value && styles.activeTabText]}>
            {item.label}
          </Text>
        </Tabs.Tab>
      ))}
    </Tabs.List>
  );
};

const styles = StyleSheet.create({
  tabList: {
    marginHorizontal: SPACING.sm,
    flex: 1,
    backgroundColor: COLORS.teal900,
    borderRadius: RADIUS.md,
    justifyContent: 'space-between',
  },
  tab: {
    paddingHorizontal: SPACING.lg,
  },
  tabTextContainer: {
    paddingVertical: SPACING.md,
  },
  indicator: {
    backgroundColor: COLORS.yellow400,
    height: 2,
  },
  tabText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray400,
  },
  activeTabText: {
    color: COLORS.gray100,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
