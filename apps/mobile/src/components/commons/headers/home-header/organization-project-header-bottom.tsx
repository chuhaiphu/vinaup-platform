import { PERMISSION_ACTION, PERMISSION_RESOURCE } from '@vinaup-platform/permission';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { prefetch } from 'fetchwire';
import React from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';

import { getProjectById } from '@/apis/project/project-apis';
import VinaupAddNew from '@/components/icons/vinaup-add-new.native';
import { Button } from '@/components/primitives/button';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { useOrganizationAbility } from '@/providers/organization/organization-ability-provider';
import { useOrganizationActionsContext } from '@/providers/organization/organization-actions-provider';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

const OrganizationProjectHeaderBottom = () => {
  const router = useRouter();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);
  const params = useGlobalSearchParams<{
    organizationId: string;
  }>();

  const { can } = useOrganizationAbility();
  const { createProject, isCreatingProject: isMutating } = useOrganizationActionsContext();

  const handleAddNew = () => {
    createProject(
      { organizationId: params.organizationId },
      {
        onSuccess: async (data) => {
          const projectId = data?.id || '';
          if (!projectId) {
            Alert.alert('Lỗi', 'Không thể tạo dự án mới');
            return;
          }

          setIsNavigating(true);
          try {
            await prefetch(() => getProjectById(projectId), {
              fetchKey: `organization-project-${projectId}`,
            });
          } catch {
            // Fallback to normal navigation if prefetch fails.
          }
          setIsNavigating(false);

          router.push({
            pathname: '/(protected)/project-detail/[projectId]',
            params: {
              projectId,
              organizationId: params.organizationId,
            },
          });
        },
        onError: (error) =>
          Alert.alert('Lỗi', generateErrorMessage(error, 'Không thể tạo dự án mới')),
      },
    );
  };

  if (!can(PERMISSION_ACTION.CREATE, PERMISSION_RESOURCE.PROJECT)) return null;

  return (
    <View style={styles.bottomContainer}>
      <View style={styles.titleWrapper}>
        <Text style={styles.titleLeft}>Thu chi</Text>
        <Text style={styles.titleRight}> Dự án tổ chức</Text>
      </View>
      <Button onPress={handleAddNew} isLoading={isMutating} loaderStyle={{ size: 30 }}>
        <VinaupAddNew width={30} height={30} />
      </Button>
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
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleLeft: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.teal900,
  },
  titleRight: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
  },
});

export default OrganizationProjectHeaderBottom;
