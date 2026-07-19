import FontAwesome6 from '@react-native-vector-icons/fontawesome6/static';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SegmentedControl, SegmentedControlItem } from '@/components/primitives/segmented-control';
import { TextToggler } from '@/components/primitives/text-toggler';
import { COLORS, FONT_SIZES, ICON_SIZES, SPACING } from '@/constants/style-constants';

type DayMode = 'busy' | 'free';

const DAY_MODE_ITEMS: SegmentedControlItem<DayMode>[] = [
  { value: 'busy', label: 'Lịch bận' },
  { value: 'free', label: 'Lịch rảnh' },
];

const PersonalCalendarHeaderBottom = () => {
  const router = useRouter();
  const params = useGlobalSearchParams<{
    calendarMode?: 'wage' | 'project';
    dayMode?: DayMode;
  }>();
  const currentMode: 'wage' | 'project' = params.calendarMode === 'project' ? 'project' : 'wage';
  const currentDayMode: DayMode = params.dayMode === 'free' ? 'free' : 'busy';

  const [localDayMode, setLocalDayMode] = useState<DayMode>(currentDayMode);

  const handleToggleMode = () => {
    router.setParams({
      calendarMode: currentMode === 'wage' ? 'project' : 'wage',
    });
  };

  return (
    <View style={styles.bottomContainer}>
      <View style={styles.titleRow}>
        <View style={styles.titleWrapper}>
          <Text style={styles.titleLeft}>Lịch</Text>
          <TextToggler
            textPair={['tiền công', 'dự án']}
            currentIndex={currentMode === 'wage' ? 0 : 1}
            onToggle={handleToggleMode}
            style={{ text: styles.togglerText }}
            rightSection={
              <FontAwesome6
                iconStyle="solid"
                name="caret-down"
                size={ICON_SIZES.md}
                color={COLORS.teal700}
              />
            }
          />
        </View>
      </View>
      <SegmentedControl
        items={DAY_MODE_ITEMS}
        value={localDayMode}
        onChange={setLocalDayMode}
        onSettled={(value) => router.setParams({ dayMode: value })}
        style={{
          pill: { backgroundColor: COLORS.white, boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)' },
          label: { fontSize: FONT_SIZES.base },
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bottomContainer: {
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleLeft: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.teal900,
  },
  togglerText: {
    fontSize: FONT_SIZES.lg,
  },
});

export default PersonalCalendarHeaderBottom;
