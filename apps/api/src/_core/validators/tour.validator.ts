import { Injectable } from '@nestjs/common';
import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

import { PrismaService } from 'src/prisma/prisma.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsTourExistConstraint implements ValidatorConstraintInterface {
  constructor(private prisma: PrismaService) { }

  async validate(value: string): Promise<boolean> {
    const exists = await this.prisma.tour.findUnique({
      where: { id: value },
    });
    return !!exists;
  }

  defaultMessage(): string {
    return '$property does not reference an existing tour';
  }
}
/** 
 * For simple cases that only need to check existence of by value in the request body only.
 * For other complex cases, handle directly in service layer
 */
export function IsTourExist(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsTourExistConstraint,
    });
  };
}


@ValidatorConstraint({ async: true })
@Injectable()
export class IsTourCalculationExistConstraint implements ValidatorConstraintInterface {
  constructor(private prisma: PrismaService) { }

  async validate(value: string): Promise<boolean> {
    const exists = await this.prisma.tourCalculation.findUnique({
      where: { id: value },
    });
    return !!exists;
  }

  defaultMessage(): string {
    return '$property does not reference an existing tour calculation';
  }
}
/** 
 * For simple cases that only need to check existence of by value in the request body only.
 * For other complex cases, handle directly in service layer
 */
export function IsTourCalculationExist(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsTourCalculationExistConstraint,
    });
  };
}


@ValidatorConstraint({ async: true })
@Injectable()
export class IsTourImplementationExistConstraint implements ValidatorConstraintInterface {
  constructor(private prisma: PrismaService) { }

  async validate(value: string): Promise<boolean> {
    const exists = await this.prisma.tourImplementation.findUnique({
      where: { id: value },
    });
    return !!exists;
  }

  defaultMessage(): string {
    return '$property does not reference an existing tour implementation';
  }
}
/** 
 * For simple cases that only need to check existence of by value in the request body only.
 * For other complex cases, handle directly in service layer
 */
export function IsTourImplementationExist(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsTourImplementationExistConstraint,
    });
  };
}


@ValidatorConstraint({ async: true })
@Injectable()
export class IsTourSettlementExistConstraint implements ValidatorConstraintInterface {
  constructor(private prisma: PrismaService) { }

  async validate(value: string): Promise<boolean> {
    const exists = await this.prisma.tourSettlement.findUnique({
      where: { id: value },
    });
    return !!exists;
  }

  defaultMessage(): string {
    return '$property does not reference an existing tour settlement';
  }
}
/** 
 * For simple cases that only need to check existence of by value in the request body only.
 * For other complex cases, handle directly in service layer
 */
export function IsTourSettlementExist(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsTourSettlementExistConstraint,
    });
  };
}
