import {
    Collection,
    Embedded,
    Entity,
    Enum,
    ManyToMany,
    ManyToOne,
    PrimaryKey,
    Property,
} from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { StudentStatus } from 'shared/model/Student';
import { v4 } from 'uuid';
import { MapType } from '../types/MapType';
import { Attendance } from './attendance.entity';
import { Grading } from './grading.entity';
import { HandInDocument } from './ratedEntity.entity';
import { Team } from './team.entity';
import { Tutorial } from './tutorial.entity';

@Entity()
export class Student {
    @PrimaryKey()
    id = v4();

    @Property()
    firstname: string;

    @Property()
    lastname: string;

    @Property()
    matriculationNo: string;

    @Enum(() => StudentStatus)
    status: StudentStatus;

    @Property()
    iliasName?: string;

    @Property()
    email?: string;

    @Property()
    courseOfStudies?: string;

    @Property()
    cakeCount: number = 0;

    @Property({ type: MapType })
    presentationPoints: Map<string, number> = new Map();

    @Embedded(() => Attendance, { array: true })
    attendances: Attendance[] = [];

    @ManyToOne()
    tutorial?: Tutorial;

    @ManyToOne()
    team?: Team;

    @ManyToMany(() => Grading, 'students', { owner: true })
    gradings = new Collection<Grading>(this);

    constructor(params: StudentParams) {
        this.firstname = params.firstname;
        this.lastname = params.lastname;
        this.matriculationNo = params.matriculationNo;
        this.status = params.status;
    }

    /**
     * Saves the given attendance in the student.
     *
     * The attendance will be saved for it's date. If there is already an attendance saved for that date it will be overriden.
     *
     * This function marks the corresponding path as modified.
     *
     * @param attendance Attendance to set.
     */
    setAttendance(attendance: Attendance): void {}

    /**
     * Returns the grading for the given hand-in if one is saved, if not `undefined` is returned.
     *
     * @param handIn hand-in to get grading for.
     *
     * @returns Grading for the given hand-in or `undefined`
     */
    getGrading(handIn: HandInDocument): Grading | undefined {
        for (const grading of this.gradings) {
            if (grading.entityId === handIn.id) {
                return grading;
            }
        }
        return undefined;
    }

    private getDateKey(date: DateTime): string {
        const dateKey = date.toISODate();

        if (!dateKey) {
            throw new Error(`Date '${date}' is not parseable to an ISODate.`);
        }

        return dateKey;
    }
}

interface StudentParams {
    firstname: string;
    lastname: string;
    matriculationNo: string;
    status: StudentStatus;
}
