import { registerDecorator, ValidationOptions } from 'class-validator';

interface IsNonNegativeValueOptions {
  /**
   * The given number is parseable to a float number.
   *
   * @default false The given number is parseable to an _integer_ number.
   */
  isFloat?: boolean;

  /**
   * The given number must not be higher than this value. If not provided the upper bound is not checked.
   */
  max?: number;
}

/**
 * Validates the property to match the luxon format of a date in the ISO format.
 *
 * @param validationOptions Options passed to the class-validator.
 */
export function IsNonNegativeNumberValue(
  options?: IsNonNegativeValueOptions,
  validationOptions?: ValidationOptions
) {
  return function (object: Record<string, any>, propertyName: string): void {
    const message: any = {
      message: validationOptions?.each
        ? `each value in ${propertyName} must a number or parsable to a non-negative number`
        : `${propertyName} must a number or parsable to a non-negative number`,
    };

    registerDecorator({
      name: 'isNonNegativeNumberValue',
      target: object.constructor,
      propertyName,
      options: { ...message, ...validationOptions },
      validator: {
        validate(value: any): boolean {
          const isFloat = Boolean(options?.isFloat);
          const parsedNumber = isFloat ? Number.parseFloat(value) : Number.parseInt(value);

          const isValidNumber = !Number.isNaN(parsedNumber) && parsedNumber >= 0;

          if (options?.max !== undefined) {
            return isValidNumber && parsedNumber <= options.max;
          } else {
            return isValidNumber;
          }
        },
      },
    });
  };
}
