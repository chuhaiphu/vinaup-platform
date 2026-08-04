import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import { PERMISSION_ACTION, PERMISSION_RESOURCE } from '@vinaup-platform/permission';
import type { ProjectStatus } from '@vinaup-platform/validation';
import dayjs from 'dayjs';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { prefetch } from 'fetchwire';
import { Suspense, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { getProjectById } from '@/apis/project/project-apis';
import { EntityListSectionSkeleton } from '@/components/commons/skeletons/entity-list-section-skeleton';
import { OrganizationProjectListSection } from '@/components/organization/project/list/organization-project-list-section';
import { FilterSelect } from '@/components/primitives/filter-select';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { UnifiedDatePicker } from '@/components/primitives/unified-date-picker';
import { DD_MM_YYYY_DATE_FORMAT, MM_YYYY_DATE_FORMAT } from '@/constants/app-constants';
import { type DatePickerMode } from '@/constants/date-constants';
import { ProjectStatusOptions } from '@/constants/project-constants';
import { COLORS, FONT_SIZES, ICON_SIZES, SPACING } from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { useOrganizationAbility } from '@/providers/organization/organization-ability-provider';
import { useOrganizationActionsContext } from '@/providers/organization/organization-actions-provider';
import { OrganizationProjectListProvider } from '@/providers/organization/project/organization-project-list-provider';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

export function OrganizationProjectScreenContent() {
  const router = useRouter();
  const { month, day } = useLocalSearchParams<{ month?: string; day?: string }>();
  const { organizationId, can } = useOrganizationAbility();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);
  const { createProject, isCreatingProject } = useOrganizationActionsContext();

  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');
  const [filterMode, setFilterMode] = useState<DatePickerMode>('month');
  const [pickerVisible, setPickerVisible] = useState(false);

  const getSelectedDate = () => {
    if (day) {
      return dayjs(day, 'YYYY-MM-DD');
    } else if (month) {
      setFilterMode('month');
      return dayjs(month, 'YYYY-MM');
    } else {
      return dayjs();
    }
  };
  const selectedDate = getSelectedDate();

  const handleDateChange = (date: dayjs.Dayjs, mode: DatePickerMode) => {
    setFilterMode(mode);
    if (mode === 'month') {
      router.setParams({ month: date.format('YYYY-MM'), day: undefined });
    } else {
      router.setParams({ day: date.format('YYYY-MM-DD'), month: undefined });
    }
  };

  const suspenseKey = `organization-project-list-${organizationId}-${filterMode}-${
    filterMode === 'month' ? selectedDate.format('YYYY-MM') : selectedDate.format('YYYY-MM-DD')
  }-${statusFilter}`;

  const handleAddNew = () => {
    createProject(
      { organizationId },
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
            params: { projectId, organizationId },
          });
        },
        onError: (error) =>
          Alert.alert('Lỗi', generateErrorMessage(error, 'Không thể tạo dự án mới')),
      },
    );
  };

  return (
    <View style={styles.container}>
      {can(PERMISSION_ACTION.CREATE, PERMISSION_RESOURCE.PROJECT) && (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            icon={require('@/assets/images/add_new.png')}
            iconRenderingMode="original"
            disabled={isCreatingProject}
            accessibilityLabel="Tạo dự án"
            onPress={handleAddNew}
          />
        </Stack.Toolbar>
      )}
      <View style={styles.projectTopContainer}>
        <PressableOpacity onPress={() => setPickerVisible(true)} style={styles.datePickerTrigger}>
          <FontAwesome5
            name="calendar-alt"
            size={ICON_SIZES.sm}
            color={COLORS.teal700}
            style={{ marginRight: SPACING.sm }}
          />
          <Text style={styles.dateText}>
            {filterMode === 'month'
              ? selectedDate.format(MM_YYYY_DATE_FORMAT)
              : selectedDate.format(DD_MM_YYYY_DATE_FORMAT)}
          </Text>
        </PressableOpacity>
        <FilterSelect
          placeholder="Trạng thái"
          options={ProjectStatusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          align="right"
        />
      </View>
      <UnifiedDatePicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        value={selectedDate}
        currentMode={filterMode}
        modes={['day', 'month']}
        onChange={handleDateChange}
      />
      <Suspense fallback={<EntityListSectionSkeleton />}>
        <OrganizationProjectListProvider
          key={suspenseKey}
          organizationId={organizationId}
          selectedDate={selectedDate}
          statusFilter={statusFilter || undefined}
          filterMode={filterMode}
        >
          <OrganizationProjectListSection
            organizationId={organizationId}
            selectedDate={selectedDate}
            statusFilter={statusFilter || undefined}
            filterMode={filterMode}
          />
        </OrganizationProjectListProvider>
      </Suspense>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  projectTopContainer: {
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
  },
});
