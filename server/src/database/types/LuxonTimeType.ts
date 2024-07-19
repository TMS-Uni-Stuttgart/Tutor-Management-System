import { Constructor, EntityProperty, Platform } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { LuxonType } from './LuxonType';

export class LuxonTimeType extends LuxonType {
    protected getClass(): Constructor<any> {
        return LuxonTimeType;
    }

    protected convertDateTimeToString(value: DateTime): string {
        return value.toISO({ suppressMilliseconds: true, includeOffset: true }) ?? '';
    }

    getSingleColumnType(_prop: EntityProperty, _platform: Platform): string {
        // Because MySQL somehow f**** up timezones provided in ISO strings we just save the plain ISO string in the database to preserve timezone information.
        return 'varchar(25)';
    }
}
