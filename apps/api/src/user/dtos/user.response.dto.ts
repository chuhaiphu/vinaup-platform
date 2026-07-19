export class UserResponse {
  id!: string;
  email!: string;
  name!: string | null;
  phone!: string | null;
  avatarUrl!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  organizationOwnedCount?: number;
  organizationLinkedCount?: number;
}
