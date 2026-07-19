import { Transform, TransformFnParams } from 'class-transformer';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * Normalizes a blank string to `undefined` BEFORE validation runs.
 * Apply to OPTIONAL fields whose validator rejects empty strings.
 */
export function TrimToUndefined() {
  return Transform(({ value }: TransformFnParams): unknown => {
    // Only normalize strings; leave numbers/arrays/etc. untouched.
    if (typeof value !== 'string') return value as unknown;
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  });
}

/**
 * Replaces a `null` value with `defaultValue` BEFORE validation runs,
 * `undefined` (an omitted field in a partial update) and real values untouched.
 *
 * Apply to OPTIONAL fields backed by a NON-nullable column: 
 * a client that sends `null` — e.g. an empty numeric input serialized as JSON `null`, 
 * or `NaN` which`JSON.stringify` turns into `null`
 */
export function NullToDefault(defaultValue: unknown) {
  return Transform(({ value }: TransformFnParams): unknown =>
    value === null ? defaultValue : (value as unknown),
  );
}

/**
 * Checks if a string is not empty and does not consist solely of whitespace characters.
 */
export function IsStringNotBlank(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStringNotBlank',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && value.trim().length > 0;
        },
        defaultMessage() {
          return '$property should not be empty or only whitespace';
        },
      },
    });
  };
}

/**
 * Cross-field rule for a date range: `endDate` must be the same as
 * or later than the sibling `startDate`.
 *
 * Apply to the `endDate` property. 
 * It reads `startDate` from the validated object.
 * Skips validation when either bound is missing.
 */
export function IsAfterOrEqualStartDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAfterOrEqualStartDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const startDate = (args.object as Record<string, unknown>)[
            'startDate'
          ];
          // Skip when either bound is absent — a partial range is not an error here.
          if (startDate == null || value == null) return true;
          if (typeof startDate !== 'string' || typeof value !== 'string') return false;
          return new Date(startDate) <= new Date(value);
        },
        defaultMessage() {
          return '$property ($value) must not be earlier than startDate';
        },
      },
    });
  };
}