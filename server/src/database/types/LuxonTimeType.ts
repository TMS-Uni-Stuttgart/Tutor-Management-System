import { Constructor, EntityProperty, Platform } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { LuxonType } from './LuxonType';

export class LuxonTimeType extends LuxonType {
    protected getClass(): Constructor<any> {
        return LuxonTimeType;
    }

    protected convertDateTimeToString(value: DateTime): string {
        // Do not include the timezone offsets because the MySQL will basically subtract the offset twice...
        return value.toISO({ suppressMilliseconds: true, includeOffset: false });
    }

    getSingleColumnType(_prop: EntityProperty, _platform: Platform): string {
        return 'datetime';
    }
}
