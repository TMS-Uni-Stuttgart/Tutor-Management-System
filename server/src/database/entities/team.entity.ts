import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { ITeam, ITeamInEntity } from 'shared/model/Team';
import { v4 } from 'uuid';
import { Student } from './student.entity';
import { Tutorial } from './tutorial.entity';

@Entity()
export class Team {
    /**
     * @param students Students to generate the team name of.
     * @returns The properly formatted team name of the given students.
     */
    static generateTeamName(students: Student[]): string {
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

    get studentCount(): number {
        return this.students.length;
    }

    constructor({ teamNo, tutorial }: TeamParams) {
        this.teamNo = teamNo;
        this.tutorial = tutorial;
    }

    /**
     * @returns Properly formatted name of this team.
     */
    get teamName(): string {
        return Team.generateTeamName(this.students.getItems());
    }

    getStudents(): Student[] {
        return this.students.getItems();
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

    getTeamName(): string {
        return Team.generateTeamName(this.students.getItems());
    }
}

interface TeamParams {
    teamNo: number;
    tutorial: Tutorial;
}
