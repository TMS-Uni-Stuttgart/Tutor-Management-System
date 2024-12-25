import { registerDecorator, ValidationOptions } from 'class-validator';

export const VALID_EMAIL_REGEX =
    /(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z-0-9]+\.)+[a-zA-Z]{2,}))/u;

/**
 * Validates the property to be a valid mail sender for nodemailer.
 *
 * N
 *
 * @param validationOptions Options passed to the class-validator.
 */
export function IsValidMailSender(validationOptions?: ValidationOptions) {
    return function (object: Record<string, any>, propertyName: string): void {
        const message: any = {
            message: validationOptions?.each
                ? `each sender in ${propertyName} must be in a valid sender format ('email' or 'name <email>')  or a comma seperated list of those.`
                : `${propertyName} must be in a valid sender format ('email' or 'name <email>') or a comma seperated list of those.`,
        };

        registerDecorator({
            name: 'isValidMailSender',
            target: object.constructor,
            propertyName,
            options: { ...message, ...validationOptions },
            validator: {
                validate(value: any): boolean {
                    if (typeof value !== 'string' || !value) {
                        return false;
                    }

                    const mail = VALID_EMAIL_REGEX.source;
                    const name = /([\p{L}\p{N}",*-]|[^\S\r\n])+/u.source;
                    const regex = new RegExp(`${mail}|(${name} <${mail}>)`, 'u');
                    const subStrings = value.split(',');

                    for (const str of subStrings) {
                        if (!regex.test(str.trim())) {
                            return false;
                        }
                    }

                    return true;
                },
            },
        });
    };
}
