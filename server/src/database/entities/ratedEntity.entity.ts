import { Embeddable, Embedded, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { HasExercisesDTO, RatedEntityDTO } from '../../module/scheinexam/scheinexam.dto';
import { ExerciseDTO, SubExerciseDTO } from '../../module/sheet/sheet.dto';
import { ExercisePointsInfo, IExercisePointsInfo } from '../../shared/model/Gradings';
import { IExercise, ISubexercise } from '../../shared/model/HasExercises';
import { Student } from './student.entity';

@Embeddable()
export class SubExercise {
    @Property()
    id: string;

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
        this.id = params.id ?? v4();
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

    static fromDTO(dto: SubExerciseDTO): SubExercise {
        return new SubExercise({
            id: dto.id,
            exerciseName: dto.exName,
            bonus: dto.bonus,
            maxPoints: dto.maxPoints,
        });
    }

    toDTO(): ISubexercise {
        return {
            id: this.id,
            exName: this.exerciseName,
            bonus: this.bonus,
            maxPoints: this.maxPoints,
        };
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

    static fromDTO(dto: ExerciseDTO): Exercise {
        return new Exercise({
            id: dto.id,
            exerciseName: dto.exName,
            bonus: dto.bonus,
            maxPoints: dto.maxPoints,
            subexercises: dto.subexercises?.map((subExDto) => SubExercise.fromDTO(subExDto)) ?? [],
        });
    }

    toDTO(): IExercise {
        return {
            id: this.id,
            bonus: this.bonus,
            exName: this.exerciseName,
            maxPoints: this.maxPoints,
            subexercises: this.subexercises.map((subEx) => subEx.toDTO()),
        };
    }
}

export abstract class HasExercises implements HandIn {
    @PrimaryKey()
    id = v4();

    @Embedded(() => Exercise, { array: true })
    exercises: Exercise[] = [];

    protected constructor(params: HasExercisesParams) {
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

    updateFromDTO(dto: HasExercisesDTO): void {
        this.exercises = dto.exercises.map((exDto) => Exercise.fromDTO(exDto));
    }
}

export abstract class RatedEntity extends HasExercises {
    // TODO: Replace with FloatType in MikroORM v5
    @Property({ type: 'float' })
    percentageNeeded: number;

    protected constructor(params: RatedEntityParams) {
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

    updateFromDTO(dto: RatedEntityDTO): void {
        super.updateFromDTO(dto);
        this.percentageNeeded = dto.percentageNeeded;
    }
}

export interface HandIn {
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
    id?: string;
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
