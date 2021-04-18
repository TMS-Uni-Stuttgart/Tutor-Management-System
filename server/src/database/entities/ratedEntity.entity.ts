import { Embeddable, Embedded, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

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
}

@Embeddable()
export class Exercise extends SubExercise {
    @Embedded({ array: true })
    subexercises: SubExercise[] = [];

    constructor(params: ExerciseParams) {
        super(params);
        this.subexercises = [...params.subexercises];
    }
}

export abstract class HasExercises {
    @PrimaryKey()
    id = v4();

    @Embedded({ array: true })
    exercises: Exercise[] = [];

    constructor(params: HasExercisesParams) {
        this.exercises = [...params.exercises];
    }
}

export abstract class RatedEntity extends HasExercises {
    // TODO: Replace with DoubleType in MikroORM v5
    @Property({ type: 'double precision' })
    percentageNeeded: number;

    constructor(params: RatedEntityParams) {
        super(params);
        this.percentageNeeded = params.percentageNeeded;
    }
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
