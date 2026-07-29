import { wireData } from 'fetchwire';

import {
  CreateSocialLinkRequest,
  SocialLinkResponse,
  UpdateSocialLinkRequest,
} from '@/interfaces/social-link-interfaces';

export async function createSocialLink(data: CreateSocialLinkRequest) {
  return wireData<SocialLinkResponse>('/social-link', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSocialLink(id: string, data: UpdateSocialLinkRequest) {
  return wireData<SocialLinkResponse>(`/social-link/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteSocialLink(id: string) {
  return wireData<void>(`/social-link/${id}`, {
    method: 'DELETE',
  });
}

export async function getSocialLinkById(id: string) {
  return wireData<SocialLinkResponse>(`/social-link/${id}`, {
    method: 'GET',
  });
}

export async function getSocialLinksByOrganizationId(organizationId: string) {
  return wireData<SocialLinkResponse[]>(`/social-link/organization/${organizationId}`, {
    method: 'GET',
  });
}

export async function getSocialLinksByUserId(userId: string) {
  return wireData<SocialLinkResponse[]>(`/social-link/user/${userId}`, {
    method: 'GET',
  });
}
