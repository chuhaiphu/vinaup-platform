import type { z } from 'zod';

import {
  createProjectCategorySchema,
  createProjectSchema,
  projectFilterSchema,
  updateProjectCategorySchema,
  updateProjectSchema,
} from '../zod-schemas/project.schema';

export type CreateProjectRequestInterface = z.infer<typeof createProjectSchema>;
export type UpdateProjectRequestInterface = z.infer<typeof updateProjectSchema>;
export type CreateProjectCategoryRequestInterface = z.infer<typeof createProjectCategorySchema>;
export type UpdateProjectCategoryRequestInterface = z.infer<typeof updateProjectCategorySchema>;
export type ProjectFilterRequestInterface = z.infer<typeof projectFilterSchema>;
