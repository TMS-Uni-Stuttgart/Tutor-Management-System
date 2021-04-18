import { Constructor, EntityProperty, Platform } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { LuxonType } from './LuxonType';

export class LuxonDateTimeType extends LuxonType {
    protected getClass(): Constructor<any> {
        return LuxonDateTimeType;
    }

    protected convertDateTimeToString(value: DateTime): string {
        return value.toISO();
    }

    getSingleColumnType(_prop: EntityProperty, _platform: Platform): string {
        return 'timestamp with time zone';
    }
}
