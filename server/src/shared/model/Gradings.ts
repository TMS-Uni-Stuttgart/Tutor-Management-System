import { IExercise, IHasExercises } from './HasExercises';

export interface GradingResponseData {
    studentId: string;
    gradingData: IGrading | undefined;
}

export interface IExerciseGrading {
    points: number;
    comment?: string;
    additionalPoints?: number;
    subExercisePoints?: [string, number][];
}

export interface IGrading {
    id: string;
    exerciseGradings: [string, IExerciseGrading][];
    belongsToTeam: boolean;
    points: number;
    comment?: string;
    additionalPoints?: number;
}

export interface IExerciseGradingDTO {
    comment?: string;
    additionalPoints?: number;
    points?: number;
    subExercisePoints?: [string, number][];
}

export interface IGradingDTO {
    exerciseGradings: [string, IExerciseGradingDTO][];
    createNewGrading: boolean;
    sheetId?: string;
    examId?: string;
    shortTestId?: string;
    comment?: string;
    additionalPoints?: number;
}

export interface IPresentationPointsDTO {
    sheetId: string;
    points: number;
}

export interface IExercisePointsInfo {
    must: number;
    bonus: number;
}

export class ExercisePointsInfo implements IExercisePointsInfo {
    readonly must: number;
    readonly bonus: number;

    get total(): number {
        return this.must + this.bonus;
    }

    constructor({ must, bonus }: Partial<IExercisePointsInfo>) {
        this.must = must ?? 0;
        this.bonus = bonus ?? 0;
    }
}

export function convertExercisePointInfoToString(exPointInfo: IExercisePointsInfo): string {
    if (exPointInfo.must > 0 && exPointInfo.bonus > 0) {
        return `${exPointInfo.must} + ${exPointInfo.bonus} Bonus`;
    } else if (exPointInfo.bonus === 0) {
        return `${exPointInfo.must}`;
    } else {
        return `${exPointInfo.bonus} Bonus`;
    }
}

export function getPointsOfExercise(exercise: IExercise): ExercisePointsInfo {
    const points: IExercisePointsInfo = { must: 0, bonus: 0 };

    if (exercise.subexercises.length === 0) {
        if (exercise.bonus) {
            return new ExercisePointsInfo({
                must: 0,
                bonus: exercise.maxPoints,
            });
        } else {
            return new ExercisePointsInfo({ must: exercise.maxPoints });
        }
    }

    const info: IExercisePointsInfo = exercise.subexercises.reduce((pts, subEx) => {
        if (subEx.bonus) {
            return { ...pts, bonus: pts.bonus + subEx.maxPoints };
        } else {
            return { ...pts, must: pts.must + subEx.maxPoints };
        }
    }, points);

    return new ExercisePointsInfo(info);
}

export function getPointsOfAllExercises({ exercises }: IHasExercises): ExercisePointsInfo {
    const info: IExercisePointsInfo = exercises.reduce(
        (pts, ex) => {
            const { must, bonus } = getPointsOfExercise(ex);

            return { must: pts.must + must, bonus: pts.bonus + bonus };
        },
        { must: 0, bonus: 0 }
    );
    return new ExercisePointsInfo(info);
}
