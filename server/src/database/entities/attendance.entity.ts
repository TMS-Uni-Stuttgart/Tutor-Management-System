import { Entity, Enum, PrimaryKey, Property } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { AttendanceState } from 'shared/model/Attendance';
import { v4 } from 'uuid';

@Entity()
export class Attendance {
    @PrimaryKey()
    id = v4();

    // TODO: Make special DateTime to handle luxon dates with mikro.
    @Property()
    date!: DateTime;

    @Property()
    note?: string;

    @Enum()
    state?: AttendanceState;
}
