import { Organization, Project, User } from 'src/prisma/generated/client';

export class ProjectCategoryResponse {
  id!: string;
  name!: string;
  description!: string | null;
  userId!: string | null;
  organizationId!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  user?: User | null;
  organization?: Organization | null;
  projects?: Project[];
}
