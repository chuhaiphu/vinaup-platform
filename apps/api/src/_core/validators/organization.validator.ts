import { Injectable } from '@nestjs/common';
import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

import { PrismaService } from 'src/prisma/prisma.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsOrganizationExistConstraint implements ValidatorConstraintInterface {
  constructor(private prisma: PrismaService) { }

  async validate(value: string): Promise<boolean> {
    const exists = await this.prisma.organization.findUnique({
      where: { id: value },
    });
    return !!exists;
  }

  defaultMessage(): string {
    return '$property does not reference an existing organization';
  }
}
export function IsOrganizationExist(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsOrganizationExistConstraint,
    });
  };
}


@ValidatorConstraint({ async: true })
@Injectable()
export class IsOrganizationRoleExistConstraint implements ValidatorConstraintInterface {
  constructor(private prisma: PrismaService) { }

  async validate(value: string): Promise<boolean> {
    const exists = await this.prisma.organizationRole.findUnique({
      where: { id: value },
    });
    return !!exists;
  }

  defaultMessage(): string {
    return '$property does not reference an existing organization role';
  }
}

export function IsOrganizationRoleExist(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsOrganizationRoleExistConstraint,
    });
  };
}


@ValidatorConstraint({ async: true })
@Injectable()
export class IsOrganizationMemberExistConstraint implements ValidatorConstraintInterface {
  constructor(private prisma: PrismaService) { }

  async validate(value: string): Promise<boolean> {
    const exists = await this.prisma.organizationMember.findUnique({
      where: { id: value },
    });
    return !!exists;
  }

  defaultMessage(): string {
    return '$property does not reference an existing organization member';
  }
}

/** 
 * For simple cases that only need to check existence of by value in the request body only.
 * 
 * For other complex cases, handle directly in service layer
 */
export function IsOrganizationMemberExist(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsOrganizationMemberExistConstraint,
    });
  };
}
