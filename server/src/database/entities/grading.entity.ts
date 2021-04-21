import {
    Collection,
    Embeddable,
    Embedded,
    Entity,
    ManyToMany,
    ManyToOne,
    PrimaryKey,
    Property,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { MapType } from '../types/MapType';
import { Scheinexam } from './scheinexam.entity';
import { Sheet } from './sheet.entity';
import { ShortTest } from './shorttest.entity';
import { Student } from './student.entity';

@Embeddable()
export class ExerciseGrading {
    @Property()
    points: number;

    @Property({ type: MapType })
    subExercisePoints: Map<string, number> = new Map();

    @Property()
    comment?: string;

    @Property({ type: 'float' })
    additionalPoints?: number;

    constructor(points: number) {
        this.points = points;
    }
}

@Entity()
export class Grading {
    @PrimaryKey()
    id = v4();

    @Property({ type: 'float' })
    additionalPoints: number = 0;

    @Property()
    comment?: string;

    @Embedded(() => ExerciseGrading, { array: true })
    exerciseGrading: ExerciseGrading[] = [];

    @ManyToOne()
    sheet?: Sheet;

    @ManyToOne()
    exam?: Scheinexam;

    @ManyToOne()
    shortTest?: ShortTest;

    @ManyToMany(() => Student, 'gradings')
    students = new Collection<Student>(this);

    // TODO: Does this need a constructor?

    get entityId(): string {
        this.assertOnlyOneEntityIsSet();

        if (this.sheet) {
            return this.sheet.id;
        }

        if (this.exam) {
            return this.exam.id;
        }

        if (this.shortTest) {
            return this.shortTest.id;
        }

        throw new Error('Neither the sheet nor the exam nor the shortTest field is set.');
    }

    private assertOnlyOneEntityIsSet() {
        const ids = [this.sheet, this.exam, this.shortTest].filter(Boolean);

        if (ids.length >= 2) {
            throw new Error(
                'Multiple of the fields "sheet", "exam" and "shortTest" are set. This is not a valid entity state. Only one of those fields must be set.'
            );
        }
    }
}
