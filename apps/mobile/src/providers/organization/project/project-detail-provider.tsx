import { useRouter } from 'expo-router';
import { useFetch, useMutationFn, type ApiError } from 'fetchwire';
import { createContext, useCallback, useContext } from 'react';
import { Alert } from 'react-native';

import {
  deleteProject as deleteProjectFn,
  getProjectById,
  updateProject as updateProjectFn,
} from '@/apis/project/project-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { ProjectResponse, UpdateProjectRequest } from '@/interfaces/project-interfaces';
import { OrganizationAbilityProvider } from '@/providers/organization/organization-ability-provider';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

interface ProjectDetailContextType {
  projectId: string;
  project: ProjectResponse;
  isRefreshingProject: boolean;
  isUpdatingProject: boolean;
  isDeletingProject: boolean;
  handleUpdateProject: (fields: UpdateProjectRequest, onSuccess?: () => void) => void;
  handleDelete: (onStart?: () => void, onFinish?: () => void) => void;
  refreshProject: () => void;
}

const ProjectDetailContext = createContext<ProjectDetailContextType | null>(null);

export function useProjectDetailContext() {
  const ctx = useContext(ProjectDetailContext);
  if (!ctx) throw new Error('useProjectDetailContext must be used within ProjectDetailProvider');
  return ctx;
}

export function ProjectDetailProvider({
  projectId,
  children,
}: {
  projectId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const {
    data: project,
    isRefreshing: isRefreshingProject,
    refreshFetch: refreshProject,
  } = useFetch(() => getProjectById(projectId), {
    fetchKey: `organization-project-${projectId}`,
    tags: [FETCH_TAG.projectByProjectId(projectId)],
  });

  const { executeMutationFn: updateProject, isMutating: isUpdatingProject } = useMutationFn(
    (updatedFields: UpdateProjectRequest) => updateProjectFn(projectId, updatedFields),
    { invalidatesTags: [FETCH_TAG.projectList, FETCH_TAG.projectByProjectId(projectId)] },
  );

  const { executeMutationFn: deleteProject, isMutating: isDeletingProject } = useMutationFn(
    () => deleteProjectFn(projectId),
    {
      invalidatesTags: [FETCH_TAG.projectList],
    },
  );

  const handleUpdateProject = useCallback(
    (updatedFields: UpdateProjectRequest, onSuccessCallback?: () => void) => {
      updateProject(updatedFields, {
        onSuccess: () => {
          onSuccessCallback?.();
        },
        onError: (error: ApiError) => {
          Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra khi cập nhật.'));
        },
      });
    },
    [updateProject],
  );

  const handleDelete = useCallback(
    (onStart?: () => void, onFinish?: () => void) => {
      if (!projectId) return;
      Alert.alert('Xác nhận', 'Bạn muốn xoá?', [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'OK',
          style: 'destructive',
          onPress: () => {
            onStart?.();
            deleteProject(undefined, {
              onSuccess: () => {
                onFinish?.();
                router.back();
              },
              onError: (error: ApiError) => {
                onFinish?.();
                Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra khi xóa.'));
              },
            });
          },
        },
      ]);
    },
    [projectId, deleteProject, router],
  );

  if (!project) {
    return null;
  }

  return (
    <ProjectDetailContext
      value={{
        projectId,
        project,
        isRefreshingProject,
        isUpdatingProject,
        isDeletingProject,
        handleUpdateProject,
        handleDelete,
        refreshProject,
      }}
    >
      <OrganizationAbilityProvider organizationId={project.organizationId ?? ''}>
        {children}
      </OrganizationAbilityProvider>
    </ProjectDetailContext>
  );
}
