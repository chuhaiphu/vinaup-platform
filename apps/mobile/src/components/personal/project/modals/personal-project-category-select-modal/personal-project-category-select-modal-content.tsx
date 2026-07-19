import Ionicons from '@react-native-vector-icons/ionicons/static';
import { useRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import VinaupAddNew from '@/components/icons/vinaup-add-new.native';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SingleSelect, SingleSelectOption } from '@/components/primitives/single-select';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ICON_SIZES,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';
import { ProjectCategoryResponse } from '@/interfaces/project-interfaces';
import {
  PersonalProjectCategoryProvider,
  usePersonalProjectCategoryContext,
} from '@/providers/personal/project/personal-project-category-provider';

import { PersonalProjectCategoryInputModal } from './personal-project-category-input-modal';

interface PersonalProjectCategorySelectModalContentProps {
  selectedCategoryId?: string | null;
  onSelect?: (category: ProjectCategoryResponse | null) => void;
  onCloseRequest?: () => void;
}

function PersonalProjectCategorySelectModalContentInner({
  selectedCategoryId,
  onSelect,
  onCloseRequest,
}: PersonalProjectCategorySelectModalContentProps) {
  const insets = useSafeAreaInsets();
  const createModalRef = useRef<SlideSheetRef | null>(null);

  const { categories, isLoading } = usePersonalProjectCategoryContext();

  const options: SingleSelectOption[] = (categories ?? [])
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((cat) => ({
      value: cat.id,
      label: cat.name,
    }));

  const handleSelect = (value: string) => {
    const selectedCategory = categories?.find((cat) => cat.id === value) ?? null;
    onSelect?.(selectedCategory);
  };

  return (
    <>
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chọn thể loại</Text>
          <PressableOpacity onPress={() => createModalRef.current?.open()} hitSlop={8}>
            <VinaupAddNew
              width={28}
              height={28}
              iconColor={COLORS.white}
              backgroundColor={COLORS.teal700}
            />
          </PressableOpacity>
        </View>

        {isLoading && (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="small" color={COLORS.teal700} />
          </View>
        )}

        {!isLoading && options.length === 0 && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>Chưa có thể loại.</Text>
          </View>
        )}

        {!isLoading && options.length > 0 && (
          <SingleSelect
            options={options}
            value={selectedCategoryId ?? ''}
            onSelectOption={handleSelect}
            renderOption={(option, isSelected, select) => (
              <Pressable
                key={option.value}
                style={({ pressed }) => [
                  styles.optionRow,
                  (pressed || isSelected) && styles.optionRowActive,
                ]}
                onPress={select}
              >
                <Text style={styles.optionLabel} numberOfLines={1}>
                  {option.label}
                </Text>
                <Ionicons
                  name={isSelected ? 'radio-button-on-sharp' : 'radio-button-off-sharp'}
                  size={ICON_SIZES.lg}
                  color={isSelected ? COLORS.teal700 : COLORS.gray300}
                />
              </Pressable>
            )}
          />
        )}
      </View>

      <PersonalProjectCategoryInputModal
        modalRef={createModalRef}
        existingCategoryNames={(categories ?? []).map((c) => c.name)}
        onCreated={(category) => {
          if (category) onSelect?.(category);
        }}
      />
    </>
  );
}

export function PersonalProjectCategorySelectModalContent(
  props: Parameters<typeof PersonalProjectCategorySelectModalContentInner>[0],
) {
  return (
    <PersonalProjectCategoryProvider>
      <PersonalProjectCategorySelectModalContentInner {...props} />
    </PersonalProjectCategoryProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.regular,
    color: COLORS.teal900,
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xl,
  },
  stateText: {
    color: COLORS.gray600,
    fontSize: FONT_SIZES.sm,
  },
  retryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  retryButtonText: {
    color: COLORS.teal700,
    fontSize: FONT_SIZES.sm,
  },
  optionRow: {
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.sm,
  },
  optionRowActive: {
    backgroundColor: '#F2FBFA',
  },
  optionLabel: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
    marginRight: SPACING.sm,
  },
});
