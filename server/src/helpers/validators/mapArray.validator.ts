import { ClassConstructor, plainToClass } from 'class-transformer';
import { registerDecorator, validate, ValidationOptions } from 'class-validator';

/**
 * Validates the property to match the format [string, ClassType]. Those arrays can be used as entries in a Map with number values.
 *
 * @param classType ClassType to check the second entry of the array against.
 * @param validationOptions Options passed to the class-validator.
 */
export function IsMapEntry(
    classType: ClassConstructor<any>,
    validationOptions?: ValidationOptions
) {
    return function (object: Record<string, any>, propertyName: string): void {
        const message: any = {
            message: validationOptions?.each
                ? `each element in ${propertyName} must be a 2-tupel in the form [string, ${classType.name}]`
                : `${propertyName} must be an array in the form [string, ${classType.name}]`,
        };

        registerDecorator({
            name: 'isMapEntry',
            target: object.constructor,
            propertyName,
            options: { ...message, ...validationOptions },
            validator: {
                async validate<T>(value: [string, T] | any): Promise<boolean> {
                    if (!isBasicMapEntryArray(value)) {
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

/**
 * Validates the property to match the format [string, number]. Those arrays can be used as entries in a Map with number values.
 *
 * @param validationOptions Options passed to the class-validator.
 */
export function IsNumberMapEntry(validationOptions?: ValidationOptions) {
    return function (object: Record<string, any>, propertyName: string): void {
        const message: any = {
            message: validationOptions?.each
                ? `each element in ${propertyName} must be a 2-tupel in the form [string, number]`
                : `${propertyName} must be an array in the form [string, number]`,
        };

        registerDecorator({
            name: 'isNumberMapEntry',
            target: object.constructor,
            propertyName,
            options: { ...message, ...validationOptions },
            validator: {
                async validate<T>(value: [string, T] | any): Promise<boolean> {
                    return isBasicMapEntryArray(value) && typeof value[1] === 'number';
                },
            },
        });
    };
}

/**
 * Checks if the given value is an array with exact two entries of which the first one needs to be a string.
 *
 * @param value Value to check.
 *
 * @returns Array can be used as a map entry.
 */
function isBasicMapEntryArray(value: [string, any] | any): boolean {
    if (!Array.isArray(value) || value.length !== 2) {
        return false;
    }

    if (typeof value[0] !== 'string') {
        return false;
    }

    return true;
}
