import { Organization, User } from 'src/prisma/generated/client';

export class ReceiptPaymentCategoryResponse {
  id!: string;
  name!: string;
  description!: string | null;
  isSystem!: boolean;
  userId!: string | null;
  organizationId!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  user?: User | null;
  organization?: Organization | null;
}
