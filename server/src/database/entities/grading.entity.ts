import { Embeddable, Embedded, Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { MapType } from '../types/MapType';

@Embeddable()
export class ExerciseGrading {
    @Property()
    points!: number;

    @Property({ type: MapType })
    subExercisePoints!: Map<string, number>;

    @Property()
    comment?: string;

    @Property({ type: 'double precision' })
    additionalPoints?: number;
}

@Entity()
export class Grading {
    @PrimaryKey()
    id = v4();

    @Property()
    sheetId?: string;

    @Property()
    examId?: string;

    @Property()
    shortTestId?: string;

    @Property({ type: 'double precision' })
    additionalPoints: number = 0;

    @Property()
    comment?: string;

    @Embedded({ array: true })
    exerciseGrading: ExerciseGrading[] = [];
}
