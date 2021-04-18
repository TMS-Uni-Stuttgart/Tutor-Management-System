import { Constructor, EntityProperty, Platform } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { LuxonType } from './LuxonType';

export class LuxonTimeType extends LuxonType {
    protected getClass(): Constructor<any> {
        return LuxonTimeType;
    }

    protected convertDateTimeToString(value: DateTime): string {
        return value.toISOTime();
    }

    getSingleColumnType(_prop: EntityProperty, _platform: Platform): string {
        return 'time with time zone';
    }
}
