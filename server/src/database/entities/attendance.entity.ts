import { Embeddable, Enum, Property } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { AttendanceState } from 'shared/model/Attendance';
import { LuxonDateType } from '../types/LuxonDateType';

@Embeddable()
export class Attendance {
    @Property({ type: LuxonDateType })
    private date: DateTime;

    @Property()
    note?: string;

    @Enum()
    state?: AttendanceState;

    /**
     * The given date gets set to the start of the day before being assigned to the `date`.
     *
     * @param date Date of the attendance.
     */
    constructor(date: DateTime) {
        this.date = date.startOf('day');
    }

    /**
     * Sets the date to the start of the day of the given date.
     *
     * @param date Date to set this attendance for.
     */
    setDate(date: DateTime): void {
        this.date = date.startOf('day');
    }

    /**
     * @param attendance Other attendance
     * @returns `true` if both attendances are for the same day.
     */
    isOnSameDay(attendance: Attendance): boolean {
        return this.isOnDay(attendance.date);
    }

    /**
     * @param date Day to check
     * @returns `true` if this attendance is for the given day.
     */
    isOnDay(date: DateTime): boolean {
        return this.date.startOf('day').equals(date.startOf('day'));
    }
}
