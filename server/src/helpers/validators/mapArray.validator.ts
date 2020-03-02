import { plainToClass } from 'class-transformer';
import { ClassType } from 'class-transformer/ClassTransformer';
import { registerDecorator, validate, ValidationOptions } from 'class-validator';

/**
 * Validates the property to match the luxon format of a date in the format 'yyyy-MM-dd'.
 *
 * @param validationOptions Options passed to the class-validator
 */
export function IsMapArray(classType: ClassType<any>, validationOptions?: ValidationOptions) {
  return function(object: object, propertyName: string) {
    const message: any = {
      message: validationOptions?.each
        ? `each element in ${propertyName} must be a 2-tupel in the form [string, ${classType.name}]`
        : `${propertyName} must be an array in the form [string, ${classType.name}]`,
    };

    registerDecorator({
      name: 'isMapArray',
      target: object.constructor,
      propertyName,
      options: { ...message, ...validationOptions },
      validator: {
        async validate<T>(value: [string, T] | any): Promise<boolean> {
          if (!Array.isArray(value) || value.length !== 2) {
            return false;
          }

          if (typeof value[0] !== 'string') {
            return false;
          }

          const transformedObject = plainToClass(classType, value[1]);

          if (typeof transformedObject !== 'object') {
            return false;
          }

          const result = await validate(transformedObject);
          return result.length === 0;
        },
      },
    });
  };
}
