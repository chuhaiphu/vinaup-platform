import { useFetchFn, useMutationFn, type ApiError } from 'fetchwire';
import { createContext, useContext, useEffect } from 'react';

import {
  createProjectCategory,
  getProjectCategoriesOfCurrentUser,
} from '@/apis/category/project-category-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { ProjectCategoryResponse } from '@/interfaces/project-interfaces';

interface PersonalProjectCategoryContextType {
  categories: ProjectCategoryResponse[];
  isLoading: boolean;
  fetchCategories: () => void;
  createCategory: (
    name: string,
    callbacks?: {
      onSuccess?: (data: ProjectCategoryResponse | null) => void;
      onError?: (e: ApiError) => void;
    },
  ) => void;
  isCreating: boolean;
}

const PersonalProjectCategoryContext = createContext<PersonalProjectCategoryContextType | null>(
  null,
);

export function usePersonalProjectCategoryContext() {
  const ctx = useContext(PersonalProjectCategoryContext);
  if (!ctx)
    throw new Error(
      'usePersonalProjectCategoryContext must be used within PersonalProjectCategoryProvider',
    );
  return ctx;
}

export function PersonalProjectCategoryProvider({ children }: { children: React.ReactNode }) {
  const {
    data: categories,
    isLoading,
    executeFetchFn: fetchCategories,
  } = useFetchFn(getProjectCategoriesOfCurrentUser, {
    fetchKey: 'personal-project-categories',
    tags: [FETCH_TAG.personalProjectCategoryList],
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const { executeMutationFn: execCreate, isMutating: isCreating } = useMutationFn(
    (name: string) => createProjectCategory({ name }),
    { invalidatesTags: [FETCH_TAG.personalProjectCategoryList] },
  );

  return (
    <PersonalProjectCategoryContext
      value={{
        categories: categories ?? [],
        isLoading: isLoading ?? false,
        fetchCategories,
        createCategory: (name, cb) => execCreate(name, cb),
        isCreating,
      }}
    >
      {children}
    </PersonalProjectCategoryContext>
  );
}
