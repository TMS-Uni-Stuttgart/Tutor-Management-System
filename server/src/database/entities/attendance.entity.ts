import { Entity, Enum, PrimaryKey, Property } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { AttendanceState } from 'shared/model/Attendance';
import { v4 } from 'uuid';
import { LuxonDateType } from '../types/LuxonDateType';

@Entity()
export class Attendance {
    @PrimaryKey()
    id = v4();

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
