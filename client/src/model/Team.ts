import { Type } from 'class-transformer';
import { HasId } from 'shared/model/Common';
import { ITeam } from 'shared/model/Team';
import { Modify } from '../typings/Modify';
import { StudentInTeam } from './Student';

interface Modified extends HasId {
    students: StudentInTeam[];
}

export class Team implements Modify<ITeam, Modified> {
    readonly id!: string;
    readonly teamNo!: number;
    readonly tutorial!: string;

    @Type(() => StudentInTeam)
    readonly students!: StudentInTeam[];

    /**
     * @returns Team number as unified string with leading 0 if necessary.
     */
    getTeamNoAsString(): string {
        return this.teamNo.toString().padStart(2, '0');
    }

    /**
     * @returns Team name with unified team number and the lastnames of the students of the team.
     */
    toString(): string {
        const studentsInTeam = this.students.length
            ? `(${this.students.map((student) => student.lastname).join(', ')})`
            : '(Keine Studierende)';

        return `#${this.teamNo.toString().padStart(2, '0')} ${studentsInTeam}`;
    }
}
