import FontAwesome6 from '@react-native-vector-icons/fontawesome6/static';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SingleSelect, SingleSelectOption } from '@/components/primitives/single-select';
import { SlideSheet, SlideSheetRef } from '@/components/primitives/slide-sheet';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, ICON_SIZES, SPACING } from '@/constants/style-constants';
import {
  PersonalProjectCategoryProvider,
  usePersonalProjectCategoryContext,
} from '@/providers/personal/project/personal-project-category-provider';

interface PersonalProjectCategorySelectorProps {
  value: string;
  onChange: (categoryId: string) => void;
}

function PersonalProjectCategorySelectorInner({
  value,
  onChange,
}: PersonalProjectCategorySelectorProps) {
  const sheetRef = useRef<SlideSheetRef>(null);
  const insets = useSafeAreaInsets();

  const { categories } = usePersonalProjectCategoryContext();

  // Need this useEffect to fetch projects by first category by default when first mounted
  useEffect(() => {
    // If no categories exist, do nothing
    if (!categories || categories.length === 0) return;
    // If a category is already selected, do nothing
    if (value !== '') return;

    // Get the first category by creation date
    const firstCategory = categories.sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
    if (firstCategory) {
      onChange(firstCategory.id);
    }
  }, [categories, value, onChange]);

  const options: SingleSelectOption[] = [
    ...(categories ?? [])
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((cat) => ({
        value: cat.id,
        label: cat.name,
      })),
    { value: '', label: 'Tất cả' },
  ];

  const selectedLabel =
    options.find((o) => o.value === value && o.value !== '')?.label || options[0]?.label;

  return (
    <>
      <PressableOpacity style={styles.trigger} onPress={() => sheetRef.current?.open()}>
        <Text style={styles.triggerPrefix}>Thu chi</Text>
        <Text style={styles.triggerText}>{selectedLabel}</Text>
        <FontAwesome6
          iconStyle="solid"
          name="caret-down"
          size={ICON_SIZES.md}
          color={COLORS.teal700}
        />
      </PressableOpacity>
      <SlideSheet ref={sheetRef}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetHeaderTitle}>Thể loại</Text>
        </View>
        <SingleSelect
          options={options}
          value={value}
          onSelectOption={(val) => sheetRef.current?.close(() => onChange(val))}
        />
        <View style={{ height: insets.bottom }} />
      </SlideSheet>
    </>
  );
}

export function PersonalProjectCategorySelector(
  props: Parameters<typeof PersonalProjectCategorySelectorInner>[0],
) {
  return (
    <PersonalProjectCategoryProvider>
      <PersonalProjectCategorySelectorInner {...props} />
    </PersonalProjectCategoryProvider>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  triggerPrefix: {
    fontSize: FONT_SIZES.lg,
  },
  triggerText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.teal700,
  },
  sheetHeader: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray300,
    alignItems: 'center',
  },
  sheetHeaderTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal900,
  },
});
