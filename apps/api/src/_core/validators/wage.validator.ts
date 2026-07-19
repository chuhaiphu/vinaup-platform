import { Injectable } from '@nestjs/common';
import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

import { PrismaService } from 'src/prisma/prisma.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsWageExistConstraint implements ValidatorConstraintInterface {
  constructor(private prisma: PrismaService) { }

  async validate(value: string): Promise<boolean> {
    const exists = await this.prisma.wage.findUnique({
      where: { id: value },
    });
    return !!exists;
  }

  defaultMessage(): string {
    return '$property does not reference an existing wage';
  }
}

export function IsWageExist(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsWageExistConstraint,
    });
  };
}
