import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { StorageModule } from 'src/storage/storage.module';

import { ProjectCategoryController } from './controllers/project-category.controller';
import { ProjectController } from './controllers/project.controller';
import { ProjectCategoryService } from './services/project-category.service';
import { ProjectService } from './services/project.service';

@Module({
  imports: [
    // ─── PrismaModule: make PrismaService injectable in this module
    PrismaModule,
    // ─── StorageModule: make StorageService injectable in this module
    StorageModule,
  ],
  controllers: [ProjectController, ProjectCategoryController],
  providers: [ProjectService, ProjectCategoryService],
})
export class ProjectModule {}
