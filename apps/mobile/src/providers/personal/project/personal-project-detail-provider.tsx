import { useRouter } from 'expo-router';
import { useFetch, useMutationFn, type ApiError } from 'fetchwire';
import { createContext, useCallback, useContext } from 'react';
import { Alert } from 'react-native';

import {
  deleteProject as deleteProjectFn,
  getProjectById,
  updateProject as updateProjectFn,
} from '@/apis/project/project-apis';
import { FETCH_TAG, getPersonalProjectRippleTags } from '@/constants/fetch-tag-constants';
import { ProjectResponse, UpdateProjectRequest } from '@/interfaces/project-interfaces';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';
interface PersonalProjectDetailContextType {
  projectId: string;
  project: ProjectResponse;
  isRefreshingProject: boolean;
  isUpdatingProject: boolean;
  isDeletingProject: boolean;
  handleUpdateProject: (fields: UpdateProjectRequest, onSuccess?: () => void) => void;
  handleDelete: (onStart?: () => void, onFinish?: () => void) => void;
  refreshProject: () => void;
}

const PersonalProjectDetailContext = createContext<PersonalProjectDetailContextType | null>(null);

export function usePersonalProjectDetailContext() {
  const ctx = useContext(PersonalProjectDetailContext);
  if (!ctx)
    throw new Error(
      'usePersonalProjectDetailContext must be used within PersonalProjectDetailProvider',
    );
  return ctx;
}

export function PersonalProjectDetailProvider({
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
    fetchKey: `personal-project-${projectId}`,
    tags: [FETCH_TAG.personalProjectByProjectId(projectId)],
  });

  const { executeMutationFn: updateProject, isMutating: isUpdatingProject } = useMutationFn(
    (updatedFields: UpdateProjectRequest) => updateProjectFn(projectId, updatedFields),
    {
      invalidatesTags: [
        ...getPersonalProjectRippleTags(),
        FETCH_TAG.personalProjectByProjectId(projectId),
      ],
    },
  );

  const { executeMutationFn: deleteProject, isMutating: isDeletingProject } = useMutationFn(
    () => deleteProjectFn(projectId),
    {
      invalidatesTags: getPersonalProjectRippleTags(),
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
    <PersonalProjectDetailContext
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
      {children}
    </PersonalProjectDetailContext>
  );
}
