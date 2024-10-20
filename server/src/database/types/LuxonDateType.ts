import { Constructor, EntityProperty, Platform } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { LuxonType } from './LuxonType';

export class LuxonDateType extends LuxonType {
    protected getClass(): Constructor<any> {
        return LuxonDateType;
    }

    protected convertDateTimeToString(value: DateTime): string {
        return value.toISODate({ format: 'extended' }) ?? '';
    }

    getSingleColumnType(_prop: EntityProperty, _platform: Platform): string {
        // TODO: Can we use the platform in v5?
        return 'date';
    }
}

/**
 * Helper type because inside the tests instantiated types are not loaded properly...
 */
export class LuxonDateArrayType extends LuxonDateType {
    protected getClass(): Constructor<any> {
        return LuxonDateArrayType;
    }

    constructor() {
        super({ array: true });
    }
}
