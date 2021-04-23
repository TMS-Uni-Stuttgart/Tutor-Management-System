import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Grading } from './grading.entity';
import { HandInDocument } from './ratedEntity.entity';
import { Student } from './student.entity';

@Entity()
export class Team {
    /**
     * @param students Students to generate the teamname of.
     * @returns The properly formatted teamname of the given students.
     */
    static generateTeamname(students: Student[]): string {
        return students
            .map((s) => s.lastname)
            .sort()
            .join('');
    }

    @PrimaryKey()
    id = v4();

    @Property()
    teamNo: number;

    @OneToMany(() => Student, (student) => student.team)
    students = new Collection<Student>(this);

    constructor(teamNo: number) {
        this.teamNo = teamNo;
    }

    /**
     * @returns Properly formatted name of this team.
     */
    get teamName(): string {
        return Team.generateTeamname(this.students.getItems());
    }

    getGradings(handIn: HandInDocument): Grading[] {
        const gradings: Grading[] = [];

        for (const student of this.students) {
            const gradingOfStudent = student.getGrading(handIn);

            if (gradingOfStudent && gradings.findIndex((g) => g.belongsToStudent(student)) === -1) {
                gradings.push(gradingOfStudent);
            }
        }

        return gradings;
    }
}
