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
import { IExerciseGrading, IGrading } from 'shared/model/Gradings';
import { v4 } from 'uuid';
import { EncryptedFloatType } from '../types/encryption/EncryptedNumberType';
import { EncryptedStringType } from '../types/encryption/EncryptedStringType';
import { MapType } from '../types/MapType';
import { Exercise, SubExercise } from './ratedEntity.entity';
import { Scheinexam } from './scheinexam.entity';
import { Sheet } from './sheet.entity';
import { ShortTest } from './shorttest.entity';
import { Student } from './student.entity';

@Embeddable()
export class ExerciseGrading {
    @Property()
    exerciseId: string;

    @Property({ type: EncryptedFloatType })
    points: number;

    // TODO: Encrypt this map?
    @Property({ type: MapType })
    subExercisePoints: Map<string, number> = new Map();

    @Property({ type: EncryptedStringType })
    comment?: string;

    @Property({ type: EncryptedFloatType })
    additionalPoints?: number;

    constructor(exerciseId: string, points: number) {
        this.exerciseId = exerciseId;
        this.points = points;
    }

    toDTO(): IExerciseGrading {
        return {
            comment: this.comment,
            points: this.points,
            additionalPoints: this.additionalPoints,
            subExercisePoints: [...this.subExercisePoints],
        };
    }

    getGradingForSubExercise(subEx: SubExercise): number | undefined {
        return this.subExercisePoints.get(subEx.id);
    }
}

@Entity()
export class Grading {
    @PrimaryKey()
    id = v4();

    @Property({ type: EncryptedFloatType })
    additionalPoints: number = 0;

    @Property({ type: EncryptedStringType })
    comment?: string;

    @Embedded(() => ExerciseGrading, { array: true })
    exerciseGradings: ExerciseGrading[] = [];

    @ManyToOne()
    sheet?: Sheet;

    @ManyToOne()
    exam?: Scheinexam;

    @ManyToOne()
    shortTest?: ShortTest;

    @ManyToMany(() => Student, 'gradings')
    students = new Collection<Student>(this);

    /**
     * Ensures that exactly one of the following properties is set: `sheet`, `exam`, `shortTest`.
     */
    constructor({ sheet, exam, shortTest }: GradingParams) {
        this.sheet = sheet;
        this.exam = exam;
        this.shortTest = shortTest;
        this.assertEntitiesAreAValidSet();
    }

    /**
     * @returns Sum of all points of all exercises and the `additionalPoints` of this grading.
     */
    get points(): number {
        const additional = this.additionalPoints ?? 0;

        return additional + this.exerciseGradings.reduce((sum, grading) => sum + grading.points, 0);
    }

    /**
     * @returns ID of the related hand-in entity.
     *
     * @throws `Error` - If this grading does not have a related hand-in entity.
     */
    get entityId(): string {
        this.assertEntitiesAreAValidSet();

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

    get belongsToTeam(): boolean {
        return this.students.length > 1;
    }

    /**
     * @param student Student to check
     * @returns `True` if this grading belongs to the given student.
     */
    belongsToStudent(student: Student): boolean {
        return this.students.getItems().findIndex((s) => s.id === student.id) !== -1;
    }

    getExerciseGrading(exercise: Exercise): ExerciseGrading | undefined {
        return this.exerciseGradings.find((exGrading) => exGrading.exerciseId === exercise.id);
    }

    toDTO(): IGrading {
        const exerciseGradings: Map<string, IExerciseGrading> = new Map();
        for (const exGrading of this.exerciseGradings) {
            exerciseGradings.set(exGrading.exerciseId, exGrading.toDTO());
        }

        return {
            id: this.id,
            points: this.points,
            additionalPoints: this.additionalPoints,
            comment: this.comment,
            belongsToTeam: this.belongsToTeam,
            exerciseGradings: [...exerciseGradings],
        };
    }

    private assertEntitiesAreAValidSet() {
        const ids = [this.sheet, this.exam, this.shortTest].filter(Boolean);

        if (ids.length >= 2) {
            throw new Error(
                'Multiple of the fields "sheet", "exam" and "shortTest" are set. This is not a valid entity state. Only one of those fields must be set.'
            );
        } else if (ids.length === 0) {
            throw new Error('Neither the sheet nor the exam nor the shortTest field is set.');
        }
    }
}

interface GradingParams {
    sheet?: Sheet;
    exam?: Scheinexam;
    shortTest?: ShortTest;
}
