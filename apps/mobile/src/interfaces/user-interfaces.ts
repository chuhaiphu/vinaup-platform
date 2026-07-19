export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  organizationOwnedCount?: number;
  organizationLinkedCount?: number;
}
