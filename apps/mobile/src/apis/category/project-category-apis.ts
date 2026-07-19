import { wireApi } from 'fetchwire';

import {
  CreateProjectCategoryRequest,
  ProjectCategoryResponse,
  UpdateProjectCategoryRequest,
} from '@/interfaces/project-interfaces';

export async function createProjectCategory(data: CreateProjectCategoryRequest) {
  return wireApi<ProjectCategoryResponse>('/project-category', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getProjectCategoriesOfCurrentUser() {
  return wireApi<ProjectCategoryResponse[]>('/project-category', {
    method: 'GET',
  });
}

export async function getProjectCategoriesByOrganizationId(organizationId: string) {
  return wireApi<ProjectCategoryResponse[]>(`/project-category/organization/${organizationId}`, {
    method: 'GET',
  });
}

export async function getProjectCategoryById(id: string) {
  return wireApi<ProjectCategoryResponse>(`/project-category/${id}`, {
    method: 'GET',
  });
}

export async function updateProjectCategory(id: string, data: UpdateProjectCategoryRequest) {
  return wireApi<ProjectCategoryResponse>(`/project-category/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProjectCategory(id: string) {
  return wireApi<void>(`/project-category/${id}`, {
    method: 'DELETE',
  });
}
