import { Embedded, Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { IAttendance } from 'shared/model/Attendance';
import { IStudent, StudentStatus } from 'shared/model/Student';
import { IStudentInTeam } from 'shared/model/Team';
import { v4 } from 'uuid';
import { EncryptedEnumType } from '../types/encryption/EncryptedEnumType';
import { EncryptedMapType } from '../types/encryption/EncryptedMapType';
import { EncryptedIntType } from '../types/encryption/EncryptedNumberType';
import { EncryptedStringType } from '../types/encryption/EncryptedStringType';
import { Attendance } from './attendance.entity';
import { HandIn } from './ratedEntity.entity';
import { Team } from './team.entity';
import { Tutorial } from './tutorial.entity';

@Entity()
export class Student {
    @PrimaryKey()
    id = v4();

    @Property({ type: EncryptedStringType })
    firstname: string;

    @Property({ type: EncryptedStringType })
    lastname: string;

    @Property({ type: EncryptedStringType })
    matriculationNo?: string;

    @Enum({ type: EncryptedEnumType })
    status: StudentStatus;

    @Property({ type: EncryptedStringType })
    iliasName?: string;

    @Property({ type: EncryptedStringType })
    email?: string;

    @Property({ type: EncryptedStringType })
    courseOfStudies?: string;

    @Property({ type: EncryptedIntType })
    cakeCount: number = 0;

    @ManyToOne()
    tutorial: Tutorial;

    @ManyToOne()
    team?: Team;

    @Property({ type: EncryptedMapType })
    private presentationPoints: Map<string, number> = new Map();

    @Embedded({ entity: () => Attendance, array: true })
    private readonly attendances: Attendance[] = [];

    constructor(params: StudentParams) {
        this.firstname = params.firstname;
        this.lastname = params.lastname;
        this.matriculationNo = params.matriculationNo;
        this.status = params.status;
        this.tutorial = params.tutorial;
    }

    /**
     * Saves the given attendance in the student.
     *
     * The attendance will be saved for it's date. If there is already an attendance saved for that date it will be overridden.
     *
     * This function marks the corresponding path as modified.
     *
     * @param attendance Attendance to set.
     */
    setAttendance(attendance: Attendance): void {
        const index = this.attendances.findIndex((a) => a.isOnSameDay(attendance));

        if (index === -1) {
            this.attendances.push(attendance);
        } else {
            this.attendances[index] = attendance;
        }
    }

    /**
     * Returns the attendance of the given date if there is one saved. If not `undefined` is returned.
     *
     * @param date Date to look up
     *
     * @returns Returns the attendance of the date or `undefined`.
     */
    getAttendance(date: DateTime): Attendance | undefined {
        return this.attendances.find((attendance) => attendance.isOnDay(date));
    }

    /**
     * @returns A copy of the array of all attendances of this student.
     */
    getAllAttendances(): Attendance[] {
        return [...this.attendances];
    }

    /**
     * Saves the given presentation points for the given hand-in.
     *
     * If there are already saved presentation points for the given hand-in the old ones will get overridden.
     *
     * @param handIn Hand-in to save grading for.
     * @param points Presentation points to save.
     */
    setPresentationPoints(handIn: HandIn, points: number): void {
        this.presentationPoints.set(handIn.id, points);
    }

    /**
     * Returns the presentation points for the given hand-in if there are any saved. If not `undefined` is returned.
     *
     * @param handIn Hand-in to get presentation points for.
     *
     * @returns Presentation points for the given hand-in or `undefined`.
     */
    getPresentationPoints(handIn: HandIn): number | undefined {
        return this.presentationPoints.get(handIn.id);
    }

    /**
     * @returns A copy of the map containing the presentation points of this student.
     */
    getAllPresentationPoints(): Map<string, number> {
        return new Map(this.presentationPoints);
    }

    toDTO(): IStudent {
        return {
            ...this.toStudentInTeam(),
            tutorial: this.tutorial?.toInEntity(),
        };
    }

    toStudentInTeam(): IStudentInTeam {
        const attendances: Map<string, IAttendance> = new Map();

        for (const attendance of this.attendances) {
            attendances.set(attendance.getDateAsKey(), attendance.toDTO());
        }

        return {
            id: this.id,
            firstname: this.firstname,
            lastname: this.lastname,
            iliasName: this.iliasName,
            matriculationNo: this.matriculationNo,
            team: this.team?.toInEntity(),
            status: this.status,
            courseOfStudies: this.courseOfStudies,
            attendances: [...attendances],
            cakeCount: this.cakeCount,
            email: this.email,
            presentationPoints: [...this.presentationPoints],
        };
    }
}

interface StudentParams {
    firstname: string;
    lastname: string;
    matriculationNo?: string;
    status: StudentStatus;
    tutorial: Tutorial;
}
