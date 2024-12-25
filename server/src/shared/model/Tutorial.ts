import { HasId } from './Common';

export interface UserInEntity {
    id: string;
    firstname: string;
    lastname: string;
}

export interface ITutorialDTO {
    correctorIds: string[];
    dates: string[];
    endTime: string;
    slot: string;
    startTime: string;
    tutorIds: string[];
}

export interface ITutorial extends HasId {
    slot: string;
    tutors: UserInEntity[];
    dates: string[];
    startTime: string;
    endTime: string;
    students: string[];
    teams: string[];
    correctors: UserInEntity[];
    // TODO: Change to {substTutorId: string, date: string}.
    substitutes: [string, string][];
}

export interface ISubstituteDTO {
    tutorId?: string;
    dates: string[];
}

/**
 * Numerated weekdays. These follow the same numeration than the [weekdays in luxon](https://moment.github.io/luxon/docs/class/src/datetime.js~DateTime.html#instance-get-weekday).
 */
export enum Weekday {
    MONDAY = 1,
    TUESDAY = 2,
    WEDNESDAY = 3,
    THURSDAY = 4,
    FRIDAY = 5,
    SATURDAY = 6,
    SUNDAY = 7,
}

export interface ITutorialGenerationDTO {
    firstDay: string;
    lastDay: string;
    excludedDates: IExcludedDate[];
    generationDatas: ITutorialGenerationData[];
}

export interface ITutorialGenerationData {
    prefix: string;
    weekday: Weekday;
    amount: number;
    interval: string;
}

export interface IExcludedDate {
    date?: string;
    interval?: string;
}
