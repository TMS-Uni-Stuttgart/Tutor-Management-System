import { Grading } from './Grading';
import { GradingResponseData } from 'shared/model/Gradings';
import { plainToClass } from 'class-transformer';
import { Team } from './Team';

export class GradingList {
    private readonly gradings: Map<string, Grading>;

    constructor(gradings: readonly GradingResponseData[]) {
        this.gradings = new Map();
        gradings.forEach(({ studentId, gradingData }) => {
            if (!!gradingData) {
                this.gradings.set(studentId, plainToClass(Grading, gradingData));
            }
        });
    }

    getOfStudent(studentId: string): Grading | undefined {
        return this.gradings.get(studentId);
    }

    getAllOfTeam(team: Team): Grading[] {
        return team.students
            .map((student) => this.getOfStudent(student.id))
            .filter<Grading>(this.isGrading);
    }

    getOfTeam(team: Team): Grading | undefined {
        const gradings = this.getAllOfTeam(team);

        if (gradings.length === 0) {
            return undefined;
        }

        if (gradings.length === 1) {
            return gradings[0];
        }

        return gradings.filter((grading) => grading.belongsToTeam)[0];
    }

    private isGrading(grading: Grading | undefined): grading is Grading {
        return grading !== undefined;
    }
}
