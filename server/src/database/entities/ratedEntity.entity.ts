import { Embeddable, Embedded, PrimaryKey, Property } from '@mikro-orm/core';
import { ExercisePointsInfo, IExercisePointsInfo } from 'shared/model/Gradings';
import { v4 } from 'uuid';
import { Student } from './student.entity';

@Embeddable()
export class SubExercise {
    @Property()
    exerciseName: string;

    @Property()
    bonus: boolean;

    @Property()
    maxPoints: number;

    constructor(params: SubExerciseParams) {
        this.exerciseName = params.exerciseName;
        this.bonus = params.bonus;
        this.maxPoints = params.maxPoints;
    }

    /**
     * @returns Total points of this exercise split by must-have and bonus points.
     */
    get pointInfo(): ExercisePointsInfo {
        return new ExercisePointsInfo({
            must: this.bonus ? 0 : this.maxPoints,
            bonus: this.bonus ? this.maxPoints : 0,
        });
    }
}

@Embeddable()
export class Exercise extends SubExercise {
    @Embedded(() => SubExercise, { array: true })
    subexercises: SubExercise[] = [];

    constructor(params: ExerciseParams) {
        super(params);
        this.subexercises = [...params.subexercises];
    }

    /**
     * The total points of the exercise not caring about bonus (sub)exercises.
     *
     * @returns Total points of the exercise.
     */
    get totalPoints(): number {
        if (this.subexercises.length > 0) {
            return this.subexercises.reduce((sum, current) => sum + current.maxPoints, 0);
        } else {
            return this.maxPoints;
        }
    }

    /**
     * Returns the total points of this exercise split by must-have and bonus points.
     *
     * Takes subexercises into the account.
     *
     * @returns Total points of this exercise split by must-have and bonus points.
     */
    get pointInfo(): ExercisePointsInfo {
        if (this.subexercises.length === 0) {
            return super.pointInfo;
        }

        const info: IExercisePointsInfo = this.subexercises.reduce(
            (prev, current) =>
                current.bonus
                    ? { ...prev, bonus: current.maxPoints + prev.bonus }
                    : { ...prev, must: current.maxPoints + prev.must },
            { must: 0, bonus: 0 }
        );
        return new ExercisePointsInfo(info);
    }
}

export abstract class HasExercises implements HandInDocument {
    @PrimaryKey()
    id = v4();

    @Embedded(() => Exercise, { array: true })
    exercises: Exercise[] = [];

    constructor(params: HasExercisesParams) {
        this.exercises = [...params.exercises];
    }

    /**
     * @returns Total points of all exercises of the hand-in split by must-have and bonus points.
     */
    get totalPoints(): ExercisePointsInfo {
        const info: IExercisePointsInfo = this.exercises.reduce(
            (sum, current) => {
                const ptInfoEx = current.pointInfo;
                return { must: sum.must + ptInfoEx.must, bonus: sum.bonus + ptInfoEx.bonus };
            },
            { must: 0, bonus: 0 }
        );
        return new ExercisePointsInfo(info);
    }
}

export abstract class RatedEntity extends HasExercises {
    // TODO: Replace with FloatType in MikroORM v5
    @Property({ type: 'float' })
    percentageNeeded: number;

    constructor(params: RatedEntityParams) {
        super(params);
        this.percentageNeeded = params.percentageNeeded;
    }

    /**
     * @param student Student to check
     * @returns `True` if the student passes this rated entity.
     */
    hasPassed(student: Student): boolean {
        return this.getPassedInformation(student).passed;
    }

    /**
     * Returns the `PassedInformation` for the given student.
     *
     * Those information contain:
     * - Has the student passed?
     * - How many points does the student achieve?
     * - How many must-have points has this entity.
     *
     * @param student Student to get the `PassedInformation` of.
     * @returns The `PassedInformation` of the given student related to the entity.
     */
    getPassedInformation(student: Student): PassedInformation {
        const total = this.totalPoints;
        const grading = student.getGrading(this);

        if (!grading) {
            return { passed: false, achieved: 0, total };
        }

        const achieved = grading.points;
        return {
            passed: achieved / total.must >= this.percentageNeeded,
            achieved,
            total,
        };
    }
}

export interface HandInDocument {
    id: string;
    exercises: Exercise[];
}

export interface HasExercisesParams {
    exercises: Exercise[];
}

export interface RatedEntityParams extends HasExercisesParams {
    percentageNeeded: number;
}

interface SubExerciseParams {
    exerciseName: string;
    bonus: boolean;
    maxPoints: number;
}

interface ExerciseParams extends SubExerciseParams {
    subexercises: SubExercise[];
}

interface PassedInformation {
    passed: boolean;
    achieved: number;
    total: ExercisePointsInfo;
}
