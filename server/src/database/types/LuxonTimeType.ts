import { Constructor, EntityProperty, Platform } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { LuxonType } from './LuxonType';

export class LuxonTimeType extends LuxonType {
    protected getClass(): Constructor<any> {
        return LuxonTimeType;
    }

    protected convertDateTimeToString(value: DateTime): string {
        return value.toISO({ suppressMilliseconds: true });
    }

    getSingleColumnType(_prop: EntityProperty, _platform: Platform): string {
        // TODO: Can we use the platform in v5?
        // We need DATETIME because TIME does not support timezones.
        return 'datetime';
    }
}
