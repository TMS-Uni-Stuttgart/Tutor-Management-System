import { Constructor, EntityProperty, Platform, Type, ValidationError } from '@mikro-orm/core';
import { DateTime } from 'luxon';

interface DateTimeTypeOptions {
    readonly nullable?: boolean;
    readonly array?: boolean;
}

export abstract class LuxonType extends Type<DateTime | DateTime[] | undefined, string> {
    constructor(private readonly options: DateTimeTypeOptions = {}) {
        super();
    }

    protected abstract getClass(): Constructor<any>;

    protected abstract convertDateTimeToString(value: DateTime): string;

    protected abstract getSingleColumnType(prop: EntityProperty, platform: Platform): string;

    getColumnType(prop: EntityProperty, platform: Platform): string {
        return this.options.array || prop.array
            ? platform.getArrayDeclarationSQL()
            : this.getSingleColumnType(prop, platform);
    }

    convertToDatabaseValue(
        value: DateTime | DateTime[] | string | undefined,
        platform: Platform
    ): string {
        return Array.isArray(value)
            ? this.convertArrayToDatabaseValue(value, platform)
            : this.convertSingleToDatabaseValue(value);
    }

    convertToJSValue(
        value: DateTime | DateTime[] | string | undefined,
        platform: Platform
    ): DateTime | DateTime[] | undefined {
        return this.options.array
            ? this.convertToArrayValue(value, platform)
            : this.convertToSingleValue(value);
    }

    private convertArrayToDatabaseValue(dates: (DateTime | string)[], platform: Platform): string {
        if (!Array.isArray(dates)) {
            throw ValidationError.invalidType(this.getClass(), dates, 'JS');
        }

        const parsedDates: string[] = dates.map((date) => this.convertSingleToDatabaseValue(date));
        return platform.marshallArray(parsedDates);
    }

    private convertSingleToDatabaseValue(value: DateTime | string | undefined): string {
        if (!value || typeof value === 'string') {
            return value ?? '';
        }

        if (value instanceof DateTime) {
            return this.convertDateTimeToString(value);
        }

        throw ValidationError.invalidType(this.getClass(), value, 'JS');
    }

    private convertToSingleValue(
        value: DateTime | DateTime[] | string | undefined
    ): DateTime | undefined {
        if (value instanceof DateTime) {
            return value;
        }

        if (!value && this.options.nullable) {
            return undefined;
        }

        if (typeof value === 'string') {
            const date = DateTime.fromISO(value);

            if (!date.isValid) {
                throw ValidationError.invalidType(this.getClass(), value, 'database');
            }
            return date;
        }

        throw ValidationError.invalidType(this.getClass(), value, 'database');
    }

    private convertToArrayValue(
        value: DateTime | DateTime[] | string | undefined,
        platform: Platform
    ): DateTime[] | undefined {
        if (!value) {
            if (this.options.nullable) {
                return undefined;
            } else {
                throw ValidationError.invalidType(this.getClass(), value, 'database');
            }
        }

        if (Array.isArray(value)) {
            return value;
        }

        if (typeof value === 'string') {
            return platform
                .unmarshallArray(value)
                .map((date) => this.convertToSingleValue(date))
                .filter(this.isDefined);
        } else {
            return [value];
        }
    }

    private isDefined(date: DateTime | undefined): date is DateTime {
        return date !== undefined;
    }
}
