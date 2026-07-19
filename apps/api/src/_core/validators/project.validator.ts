import { Injectable } from '@nestjs/common';
import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

import { PrismaService } from 'src/prisma/prisma.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsProjectExistConstraint implements ValidatorConstraintInterface {
  constructor(private prisma: PrismaService) { }

  async validate(value: string): Promise<boolean> {
    const exists = await this.prisma.project.findUnique({
      where: { id: value },
    });
    return !!exists;
  }

  defaultMessage(): string {
    return '$property does not reference an existing project';
  }
}

/** 
 * For simple cases that only need to check existence of by value in the request body only.
 * 
 * For other complex cases, handle directly in service layer
 */
export function IsProjectExist(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsProjectExistConstraint,
    });
  };
}
