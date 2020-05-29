import { registerDecorator, ValidationOptions } from 'class-validator';
import { DateTime, Interval } from 'luxon';

/**
 * Validates the property to match the luxon format of a date in the ISO format.
 *
 * @param validationOptions Options passed to the class-validator.
 */
export function IsLuxonDateTime(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    const message: any = {
      message: validationOptions?.each
        ? `each date in ${propertyName} must be in a valid ISO format`
        : `${propertyName} must be in the ISO format`,
    };

    registerDecorator({
      name: 'isLuxonDate',
      target: object.constructor,
      propertyName,
      options: { ...message, ...validationOptions },
      validator: {
        validate(value: any): boolean {
          const date = DateTime.fromISO(value);

          return date.isValid;
        },
      },
    });
  };
}

/**
 * Validates the property to match the luxon format of an interval in the ISO format.
 *
 * @param validationOptions Options passed to the class-validator.
 */
export function IsLuxonInterval(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    const message: any = {
      message: validationOptions?.each
        ? `each interval in ${propertyName} must be in a valid ISO format`
        : `${propertyName} must be in the ISO format`,
    };

    registerDecorator({
      name: 'isLuxonInterval',
      target: object.constructor,
      propertyName,
      options: { ...message, ...validationOptions },
      validator: {
        validate(value: any): boolean {
          const interval = Interval.fromISO(value);

          return interval.isValid && !interval.invalidReason;
        },
      },
    });
  };
}
