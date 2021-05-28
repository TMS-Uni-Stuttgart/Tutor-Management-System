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
import { IAttendance } from 'shared/model/Attendance';
import { IGrading } from 'shared/model/Gradings';
import { IStudent, StudentStatus } from 'shared/model/Student';
import { IStudentInTeam } from 'shared/model/Team';
import { v4 } from 'uuid';
import { EncryptedEnumType } from '../types/encryption/EncryptedEnumType';
import { EncryptedMapType } from '../types/encryption/EncryptedMapType';
import { EncryptedIntType } from '../types/encryption/EncryptedNumberType';
import { EncryptedStringType } from '../types/encryption/EncryptedStringType';
import { Attendance } from './attendance.entity';
import { Grading } from './grading.entity';
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

    @ManyToMany(() => Grading, 'students', { owner: true, eager: true })
    gradings = new Collection<Grading>(this);

    @Property({ type: EncryptedMapType })
    private presentationPoints: Map<string, number> = new Map();

    @Embedded(() => Attendance, { array: true })
    private attendances: Attendance[] = [];

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
     * Saves the given grading for this student.
     *
     * If there is already a saved grading for same hand-in the old one will get replaced.
     *
     * @param grading Grading so save.
     */
    setGrading(grading: Grading): void {
        const index = this.getIndexOfGradingForSameEntity(grading);

        if (index === -1) {
            this.gradings.add(grading);
        } else {
            this.gradings[index] = grading;
        }
    }

    /**
     * Returns the grading for the given hand-in if one is saved, if not `undefined` is returned.
     *
     * @param handIn hand-in to get grading for.
     *
     * @returns Grading for the given hand-in or `undefined`
     */
    getGrading(handIn: HandIn): Grading | undefined {
        for (const grading of this.gradings) {
            if (grading.entityId === handIn.id) {
                return grading;
            }
        }
        return undefined;
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

    /**
     * Searches for a grading for the same entity as the given one.
     *
     * Returns the index of the found grading, if there is one. Otherwise `-1` is returned.
     *
     * @param grading Grading to check
     * @returns Index of the grading for the same entity. `-1` if there is no such entity.
     */
    private getIndexOfGradingForSameEntity(grading: Grading): number {
        for (let i = 0; i < this.gradings.length; i++) {
            const grad = this.gradings[i];
            if (grad.entityId === grading.entityId) {
                return i;
            }
        }

        return -1;
    }

    toDTO(): IStudent {
        return {
            ...this.toStudentInTeam(),
            tutorial: this.tutorial?.toInEntity(),
        };
    }

    toStudentInTeam(): IStudentInTeam {
        const attendances: Map<string, IAttendance> = new Map();
        const gradings: Map<string, IGrading> = new Map();

        for (const attendance of this.attendances) {
            attendances.set(attendance.getDateAsKey(), attendance.toDTO());
        }

        for (const grading of this.gradings) {
            gradings.set(grading.entityId, grading.toDTO());
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
            gradings: [...gradings],
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
