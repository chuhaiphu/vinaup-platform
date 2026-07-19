import { Prisma } from 'src/prisma/generated/client';

export const projectCategoryQueryArgs = {
  include: { projects: true },
} satisfies Prisma.ProjectCategoryDefaultArgs;

export type ProjectCategoryResponse = Prisma.ProjectCategoryGetPayload<typeof projectCategoryQueryArgs>;
