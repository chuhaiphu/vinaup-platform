import { HttpStatus, NotFoundException } from '@nestjs/common';

export class ProjectNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'PROJECT_NOT_FOUND', message: 'Project not found', statusCode: HttpStatus.NOT_FOUND });
  }
}

export class ProjectCategoryNotFoundException extends NotFoundException {
  constructor() {
    super({ error: 'PROJECT_CATEGORY_NOT_FOUND', message: 'Project category not found', statusCode: HttpStatus.NOT_FOUND });
  }
}
