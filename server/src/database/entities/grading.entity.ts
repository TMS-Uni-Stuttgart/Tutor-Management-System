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
import { ExerciseGradingDTO, GradingDTO } from '../../module/student/student.dto';
import { EncryptedMapType } from '../types/encryption/EncryptedMapType';
import { EncryptedFloatType } from '../types/encryption/EncryptedNumberType';
import { EncryptedStringType } from '../types/encryption/EncryptedStringType';
import { Exercise, HandIn, SubExercise } from './ratedEntity.entity';
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

    @Property({ type: EncryptedMapType })
    subExercisePoints: Map<string, number> = new Map();

    @Property({ type: EncryptedStringType })
    comment?: string;

    @Property({ type: EncryptedFloatType })
    additionalPoints?: number;

    constructor(exerciseId: string, points: number) {
        this.exerciseId = exerciseId;
        this.points = points;
    }

    getGradingForSubExercise(subEx: SubExercise): number | undefined {
        return this.subExercisePoints.get(subEx.id);
    }

    updateFromDTO(dto: ExerciseGradingDTO): void {
        this.points = dto.points ?? 0;
        this.additionalPoints = dto.additionalPoints;
        this.comment = dto.comment;
        this.subExercisePoints = new Map(dto.subExercisePoints ?? []);
    }

    toDTO(): IExerciseGrading {
        return {
            comment: this.comment,
            points: this.points,
            additionalPoints: this.additionalPoints,
            subExercisePoints: [...this.subExercisePoints],
        };
    }

    static fromDTO(exerciseId: string, dto: ExerciseGradingDTO): ExerciseGrading {
        const exGrading = new ExerciseGrading(exerciseId, dto.points ?? 0);
        exGrading.updateFromDTO(dto);
        return exGrading;
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

    @ManyToOne(() => Sheet)
    private sheet?: Sheet;

    @ManyToOne(() => Scheinexam)
    private exam?: Scheinexam;

    @ManyToOne(() => ShortTest)
    private shortTest?: ShortTest;

    @Property({ nullable: false })
    handInId?: string;

    @ManyToMany({ entity: () => Student, owner: true })
    students = new Collection<Student>(this);

    /**
     * Ensures that exactly one of the following properties is set: `sheet`, `exam`, `shortTest`.
     */
    constructor({ handIn }: GradingParams) {
        this.setHandIn(handIn);
        this.assertEntitiesAreAValidSet();
    }

    /**
     * @returns Sum of all points of all exercises and the `additionalPoints` of this grading.
     */
    get points(): number {
        const additional = this.additionalPoints ?? 0;

        return additional + this.exerciseGradings.reduce((sum, grading) => sum + grading.points, 0);
    }

    get handIn(): HandIn {
        this.assertEntitiesAreAValidSet();

        if (this.sheet) {
            return this.sheet;
        }

        if (this.exam) {
            return this.exam;
        }

        if (this.shortTest) {
            return this.shortTest;
        }

        throw new Error('Neither the sheet nor the exam nor the shortTest field is set.');
    }

    /**
     * @returns ID of the related hand-in entity.
     *
     * @throws `Error` - If this grading does not have a related hand-in entity.
     */
    get entityId(): string {
        return this.handIn.id;
    }

    get belongsToTeam(): boolean {
        return this.students.length > 1;
    }

    updateFromDTO({ dto, handIn }: UpdateParams): void {
        this.setHandIn(handIn);
        this.assertEntitiesAreAValidSet();

        this.comment = dto.comment;
        this.additionalPoints = dto.additionalPoints ?? 0;
        this.exerciseGradings = [];

        for (const [exerciseId, exerciseGradingDTO] of dto.exerciseGradings) {
            this.exerciseGradings.push(ExerciseGrading.fromDTO(exerciseId, exerciseGradingDTO));
        }
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

    private setHandIn(handIn: HandIn): void {
        this.handInId = undefined;
        this.sheet = undefined;
        this.exam = undefined;
        this.shortTest = undefined;

        if (handIn instanceof Sheet) {
            this.sheet = handIn;
        } else if (handIn instanceof Scheinexam) {
            this.exam = handIn;
        } else if (handIn instanceof ShortTest) {
            this.shortTest = handIn;
        }

        this.handInId = this.handIn.id;
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
    handIn: HandIn;
}

interface UpdateParams {
    dto: GradingDTO;
    handIn: HandIn;
}
