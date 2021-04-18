import { Embeddable, Enum, Property } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { AttendanceState } from 'shared/model/Attendance';
import { LuxonDateType } from '../types/LuxonDateType';

@Embeddable()
export class Attendance {
    @Property({ type: LuxonDateType })
    date: DateTime;

    @Property()
    note?: string;

    @Enum()
    state?: AttendanceState;

    constructor(date: DateTime) {
        this.date = date;
    }
}
