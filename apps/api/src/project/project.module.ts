import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StorageModule } from 'src/storage/storage.module';

import { ProjectCategoryController } from './controllers/project-category.controller';
import { ProjectController } from './controllers/project.controller';
import { ProjectCategoryService } from './services/project-category.service';
import { ProjectService } from './services/project.service';

@Module({
  imports: [
    // ─── PrismaModule: make PrismaService injectable in this module ───────────────
    // The project services below inject PrismaService for DB access. DI only resolves a
    // dependency whose provider is visible in THIS module's scope — without this import,
    // building the services would fail at startup.
    PrismaModule,
    StorageModule,
    AuthModule,
    // ─── ValidatorsModule: register the custom request-DTO validators ───
    ],
  controllers: [ProjectController, ProjectCategoryController],
  providers: [ProjectService, ProjectCategoryService],
})
export class ProjectModule {}
