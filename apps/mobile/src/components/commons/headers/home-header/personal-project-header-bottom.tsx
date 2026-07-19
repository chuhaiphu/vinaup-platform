import { useRouter } from 'expo-router';
import { prefetch } from 'fetchwire';
import React from 'react';
import { View, Alert, StyleSheet, Text } from 'react-native';

import { getProjectById } from '@/apis/project/project-apis';
import VinaupAddNew from '@/components/icons/vinaup-add-new.native';
import { Button } from '@/components/primitives/button';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { usePersonalActionsContext } from '@/providers/personal/personal-actions-provider';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

const PersonalProjectHeaderBottom = () => {
  const router = useRouter();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);
  // const params = useGlobalSearchParams<{ categoryId?: string }>();
  // const currentCategoryId = params.categoryId || '';

  // const { data: categories, executeFetchFn: fetchCategories } = useFetchFn(
  //   getProjectCategoriesOfCurrentUser,
  //   {
  //     fetchKey: 'personal-project-categories',
  //     tags: ['personal-project-categories'],
  //   }
  // );

  // useEffect(() => {
  //   fetchCategories();
  // }, [fetchCategories]);

  // const selectedCategory = currentCategoryId
  //   ? (categories ?? []).find((c) => c.id === currentCategoryId)
  //   : undefined;

  const { createProject, isCreatingProject: isMutating } = usePersonalActionsContext();

  const handleAddNew = () => {
    createProject({
      onSuccess: async (data) => {
        setIsNavigating(true);
        try {
          await prefetch(() => getProjectById(data?.id || ''), {
            fetchKey: `personal-project-${data?.id}`,
          });
        } catch {
          // Fallback to normal navigation if prefetch fails.
        }
        setIsNavigating(false);
        router.push({
          pathname: '/(protected)/project-detail/[projectId]',
          params: { projectId: data?.id || '' },
        });
      },
      onError: (error) => Alert.alert('Lỗi', generateErrorMessage(error)),
    });
  };

  return (
    <View style={styles.bottomContainer}>
      <View style={styles.leftContainer}>
        <Text style={styles.leftText}>Thu chi</Text>
        <Text style={styles.leftSubtext}>Dự án</Text>
      </View>
      <View style={styles.rightContainer}>
        <PressableOpacity
          onPress={() =>
            router.navigate({
              pathname: '/(protected)/personal/(tabs)/calendar',
              params: { calendarMode: 'project' },
            })
          }
        >
          <Text style={styles.calendarLinkText}>Xem lịch</Text>
        </PressableOpacity>
        <Button onPress={handleAddNew} isLoading={isMutating} loaderStyle={{ size: 30 }}>
          <VinaupAddNew width={30} height={30} />
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomContainer: {
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  leftText: {
    fontSize: FONT_SIZES.lg,
  },
  leftSubtext: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.teal700,
  },
  calendarLinkText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal700,
  },
});

export default PersonalProjectHeaderBottom;
