import { wireApi } from 'fetchwire';

import {
  TourImplementationResponse,
  TourImplementationWithMeta,
  UpdateTourImplementationRequest,
  ManageMembersAssignedRequest,
  CreateUserAssignedRequest,
  UpdateUserAssignedRequest,
  MemberAssignedTourImplementationResponse,
  MemberAssignedTourImplementationWithMeta,
  UserAssignedTourImplementationResponse,
  TourImplementationAssignmentWithMeta,
  UpdateTourImplementationAssignmentRequest,
} from '@/interfaces/tour-implementation-interfaces';

export async function getTourImplementationByTourId(tourId: string) {
  return wireApi<TourImplementationWithMeta>(`/tour-implementation/by-tour/${tourId}`, {
    method: 'GET',
  });
}

export async function updateTourImplementation(
  tourImplementationId: string,
  data: UpdateTourImplementationRequest,
) {
  return wireApi<TourImplementationResponse>(`/tour-implementation/${tourImplementationId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Members Assigned APIs
export async function getMembersAssignedByTourImplementationId(tourImplementationId: string) {
  return wireApi<MemberAssignedTourImplementationWithMeta[]>(
    `/tour-implementation/${tourImplementationId}/members-assigned`,
    {
      method: 'GET',
    },
  );
}

export async function manageMembersAssigned(
  tourImplementationId: string,
  data: ManageMembersAssignedRequest,
) {
  return wireApi<MemberAssignedTourImplementationResponse[]>(
    `/tour-implementation/${tourImplementationId}/members-assigned`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
}

// User Assigned APIs
export async function addUserAssigned(data: CreateUserAssignedRequest) {
  return wireApi<UserAssignedTourImplementationResponse>(
    `/tour-implementation-assignment/users-assigned`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
}

export async function updateUserAssigned(userAssignedId: string, data: UpdateUserAssignedRequest) {
  return wireApi<UserAssignedTourImplementationResponse>(
    `/tour-implementation-assignment/users-assigned/${userAssignedId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
  );
}

// Assignment APIs
export async function getAssignmentsByTourImplementationId(tourImplementationId: string) {
  return wireApi<TourImplementationAssignmentWithMeta[]>(
    `/tour-implementation-assignment/tour-implementation/${tourImplementationId}`,
    {
      method: 'GET',
    },
  );
}

export async function createAssignment(tourImplementationId: string) {
  return wireApi<TourImplementationAssignmentWithMeta>(
    `/tour-implementation-assignment/tour-implementation/${tourImplementationId}`,
    { method: 'POST' },
  );
}

export async function updateAssignment(
  assignmentId: string,
  data: UpdateTourImplementationAssignmentRequest,
) {
  return wireApi<TourImplementationAssignmentWithMeta>(
    `/tour-implementation-assignment/${assignmentId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
  );
}

export async function deleteAssignment(assignmentId: string) {
  return wireApi<void>(`/tour-implementation-assignment/${assignmentId}`, {
    method: 'DELETE',
  });
}

export async function removeUserAssigned(userAssignedId: string) {
  return wireApi<void>(`/tour-implementation-assignment/users-assigned/${userAssignedId}`, {
    method: 'DELETE',
  });
}
