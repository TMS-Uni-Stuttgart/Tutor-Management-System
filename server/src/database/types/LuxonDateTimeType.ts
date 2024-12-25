import { Constructor, EntityProperty, Platform } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { LuxonType } from './LuxonType';

export class LuxonDateTimeType extends LuxonType {
    protected getClass(): Constructor<any> {
        return LuxonDateTimeType;
    }

    protected convertDateTimeToString(value: DateTime): string {
        return value.toISO({ suppressMilliseconds: true }) ?? '';
    }

    getSingleColumnType(_prop: EntityProperty, _platform: Platform): string {
        return 'varchar(25)';
    }
}
