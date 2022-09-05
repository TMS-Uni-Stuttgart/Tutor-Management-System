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

    getGradingOfStudent(studentId: string): Grading | undefined {
        return this.gradings.get(studentId);
    }

    getAllGradingsOfTeam(team: Team): Grading[] {
        return team.students
            .map((student) => this.getGradingOfStudent(student.id))
            .filter<Grading>(this.isGrading);
    }

    getGradingOfTeam(team: Team): Grading | undefined {
        const gradings = this.getAllGradingsOfTeam(team);

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
