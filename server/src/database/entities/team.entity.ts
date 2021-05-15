import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { ITeam, ITeamInEntity } from 'shared/model/Team';
import { v4 } from 'uuid';
import { Grading } from './grading.entity';
import { HandIn } from './ratedEntity.entity';
import { Student } from './student.entity';
import { Tutorial } from './tutorial.entity';

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

    @ManyToOne()
    tutorial: Tutorial;

    constructor({ teamNo, tutorial }: TeamParams) {
        this.teamNo = teamNo;
        this.tutorial = tutorial;
    }

    /**
     * @returns Properly formatted name of this team.
     */
    get teamName(): string {
        return Team.generateTeamname(this.students.getItems());
    }

    getGradings(handIn: HandIn): Grading[] {
        const gradings: Grading[] = [];

        for (const student of this.students) {
            const gradingOfStudent = student.getGrading(handIn);

            if (gradingOfStudent && gradings.findIndex((g) => g.belongsToStudent(student)) === -1) {
                gradings.push(gradingOfStudent);
            }
        }

        return gradings;
    }

    toDTO(): ITeam {
        return {
            id: this.id,
            teamNo: this.teamNo,
            tutorial: this.tutorial.id,
            students: this.students.getItems().map((student) => student.toStudentInTeam()),
        };
    }

    toInEntity(): ITeamInEntity {
        return { id: this.id, teamNo: this.teamNo };
    }
}

interface TeamParams {
    teamNo: number;
    tutorial: Tutorial;
}
