import { Embeddable, Embedded, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Embeddable()
export class SubExercise {
    @Property()
    exerciseName!: string;

    @Property()
    bonus!: boolean;

    @Property()
    maxPoints!: number;
}

@Embeddable()
export class Exercise extends SubExercise {
    @Embedded({ array: true })
    subexercises: SubExercise[] = [];
}

export abstract class HasExercises {
    @PrimaryKey()
    id = v4();

    @Embedded({ array: true })
    exercises: Exercise[] = [];
}

export abstract class RatedEntity extends HasExercises {
    // TODO: Replace with DoubleType in MikroORM v5
    @Property({ type: 'double precision' })
    percentageNeeded!: number;
}
