import { useMutationFn, type ApiError } from 'fetchwire';
import { createContext, useContext } from 'react';

import { createProject } from '@/apis/project/project-apis';
import { createWage } from '@/apis/wage/wage-apis';
import {
  getPersonalProjectRippleTags,
  getPersonalWageRippleTags,
} from '@/constants/fetch-tag-constants';
import { ProjectResponse } from '@/interfaces/project-interfaces';
import { WageResponse } from '@/interfaces/wage-interfaces';
import { generateDateCode } from '@/utils/generator/string-generator/generate-date-code';

interface PersonalActionsContextType {
  createProject: (cb?: {
    onSuccess?: (data: ProjectResponse | null) => void;
    onError?: (e: ApiError) => void;
  }) => void;
  createWage: (cb?: {
    onSuccess?: (data: WageResponse | null) => void;
    onError?: (e: ApiError) => void;
  }) => void;
  isCreatingProject: boolean;
  isCreatingWage: boolean;
}

const PersonalActionsContext = createContext<PersonalActionsContextType | null>(null);

export function usePersonalActionsContext() {
  const ctx = useContext(PersonalActionsContext);
  if (!ctx)
    throw new Error('usePersonalActionsContext must be used within PersonalActionsProvider');
  return ctx;
}

export function PersonalActionsProvider({ children }: { children: React.ReactNode }) {
  const { executeMutationFn: execCreateProject, isMutating: isCreatingProject } = useMutationFn(
    () =>
      createProject({
        code: generateDateCode(),
        description: 'Dự án',
        endDate: new Date().toISOString(),
        startDate: new Date().toISOString(),
      }),
    { invalidatesTags: getPersonalProjectRippleTags() },
  );

  const { executeMutationFn: execCreateWage, isMutating: isCreatingWage } = useMutationFn(
    () =>
      createWage({
        code: generateDateCode(),
        description: 'Tiền công',
        endDate: new Date().toISOString(),
        startDate: new Date().toISOString(),
      }),
    { invalidatesTags: getPersonalWageRippleTags() },
  );

  return (
    <PersonalActionsContext
      value={{
        createProject: (cb) => execCreateProject(cb),
        createWage: (cb) => execCreateWage(cb),
        isCreatingProject,
        isCreatingWage,
      }}
    >
      {children}
    </PersonalActionsContext>
  );
}
