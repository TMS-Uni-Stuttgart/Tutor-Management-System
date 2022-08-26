import { BadRequestException, Logger } from '@nestjs/common';
import { IExerciseGrading, IGrading } from 'shared/model/Gradings';
import { isDocument } from '@typegoose/typegoose';
import { plainToClass, Transform, Type } from 'class-transformer';
import { Types } from 'mongoose';
import { ClassType } from '../../helpers/ClassConstructor';
import { ExerciseGradingDTO, GradingDTO } from '../../module/student/student.dto';
import { ExerciseDocument, SubExerciseDocument } from './exercise.model';
import { StudentDocument } from './student.model';

export class SerializableMap<K extends string, V> extends Map<K, V> {
    toJSON(): string {
        return JSON.stringify([...this]);
    }

    static fromJSON<K extends string, V>(
        json: unknown,
        type?: ClassType<V>
    ): SerializableMap<K, V> {
        const data: unknown = typeof json === 'string' ? JSON.parse(json) : json;

        if (!Array.isArray(data) && !(data instanceof Map)) {
            Logger.error(
                'Given data is not an array and therefore not serializable to a SerializableMap. An empty Map is returned instead.',
                undefined,
                'SerializableMap'
            );
            Logger.error(json);
            return new SerializableMap();
        }

        const map = new SerializableMap<K, V>(data);

        if (!type) {
            return map;
        }

        const parsedMap = new SerializableMap<K, V>();

        for (const [key, value] of map.entries()) {
            parsedMap.set(key, plainToClass(type, value));
        }

        return parsedMap;
    }
}

export class ExerciseGrading {
    constructor(options?: { points: number }) {
        this._points = options?.points ?? 0;
    }

    comment?: string;
    additionalPoints?: number;

    @Transform(({ value }) => SerializableMap.fromJSON(value))
    subExercisePoints?: SerializableMap<string, number>;

    private _points: number;

    get points(): number {
        const addPoints = this.additionalPoints ?? 0;

        if (!this.subExercisePoints) {
            return this._points + addPoints;
        }

        let sum = 0;

        this.subExercisePoints.forEach((value) => {
            sum += value;
        });

        return sum + addPoints;
    }

    set points(newPoints: number) {
        this._points = newPoints;
    }

    getGradingForSubexercise(subExercise: SubExerciseDocument): number | undefined {
        if (!this.subExercisePoints) {
            return undefined;
        }

        return this.subExercisePoints.get(subExercise.id);
    }

    /**
     * Converts the given DTO into a grading document for a single exercise.
     *
     * For more information {@see ExerciseGradingModel#updateFromDTO}
     *
     * @param dto DTO to convert to a document.
     *
     * @returns ExerciseGradingDocument generated from the DTO.
     *
     * @throws `BadRequestException` - If neither the `points` nor the `subExercisePoints` property is set.
     */
    static fromDTO(dto: ExerciseGradingDTO): ExerciseGrading {
        const grading = new ExerciseGrading({ points: 0 });
        grading.updateFromDTO(dto);

        return grading;
    }

    /**
     * Updates the documents information according to the given DTO.
     * The DTO must hold either a `points` property or a `subExercisePoints` property. Otherwise an exception is thrown.
     *
     * @param dto DTO to update the document with.
     *
     * @throws `BadRequestException` - If neither the `points` nor the `subExercisePoints` property is set.
     */
    private updateFromDTO(dto: ExerciseGradingDTO) {
        const { additionalPoints, comment, points, subExercisePoints } = dto;

        if (points === undefined && subExercisePoints === undefined) {
            throw new BadRequestException(
                `At least one of the two properties 'points' and 'subExercisePoints' has to be set in the DTO.`
            );
        }

        this.comment = comment;
        this.additionalPoints = additionalPoints;
        this.points = points ?? 0;
        this.subExercisePoints = !!subExercisePoints
            ? new SerializableMap(subExercisePoints)
            : undefined;
    }

    toDTO(): IExerciseGrading {
        const { comment, additionalPoints, points, subExercisePoints } = this;

        return {
            comment,
            additionalPoints,
            points,
            subExercisePoints: subExercisePoints ? [...subExercisePoints] : undefined,
        };
    }
}

export class Grading {
    id: string;

    @Transform(({ value }) => SerializableMap.fromJSON(value, ExerciseGrading))
    exerciseGradings: SerializableMap<string, ExerciseGrading>;

    comment?: string;
    additionalPoints?: number;

    @Type(() => String)
    private students: string[];

    sheetId?: string;
    examId?: string;
    shortTestId?: string;

    get entityId(): string {
        this.assertOnlyOneIdIsSet();

        if (this.sheetId) {
            return this.sheetId;
        }

        if (this.examId) {
            return this.examId;
        }

        if (this.shortTestId) {
            return this.shortTestId;
        }

        throw new Error('Neither the sheetId nor the examId nor the shortTestId field is set.');
    }

    get belongsToTeam(): boolean {
        return this.students.length >= 2;
    }

    constructor() {
        this.id = new Types.ObjectId().toHexString();
        this.students = [];
        this.exerciseGradings = new SerializableMap();
    }

    /**
     * Adds a student to this grading to "use" it.
     *
     * @param student Student to add to this grading.
     */
    addStudent(student: StudentDocument): void {
        const idx = this.students.findIndex((doc) => {
            const id = isDocument(doc) ? doc.id : doc.toString();
            return id === student.id;
        });

        if (idx === -1) {
            this.students.push(student.id);
        }
    }

    /**
     * Removes the student from 'using' this grading.
     *
     * @param student Student to remove.
     */
    removeStudent(student: StudentDocument): void {
        const idx = this.students.findIndex((studentId) => studentId === student.id);

        if (idx !== -1) {
            this.students.splice(idx, 1);
        }
    }

    /**
     * Checks if this grading belongs to the given student.
     *
     * @param student Student to check.
     *
     * @returns True if this grading belongs to the given student, false otherwise.
     */
    belongsToStudent(student: StudentDocument): boolean {
        const idx = this.students.findIndex((studentId) => studentId === student.id);

        return idx !== -1;
    }

    /**
     * @returns A copy of the list containing all students of this grading.
     */
    getStudents(): string[] {
        return [...this.students];
    }

    /**
     * Sum of all points of all exercises and the `additionalPoints` of this grading.
     */
    get points(): number {
        let sum = this.additionalPoints ?? 0;

        for (const [, doc] of this.exerciseGradings) {
            sum += doc.points;
        }

        return sum;
    }

    /**
     * Converts the given DTO to a newly created GradingDocument.
     *
     * If the DTO contains a `gradingId` property the `id` of the created document will be the `gradingId`.
     *
     * @param dto DTO to convert to a GradingDocument.
     *
     * @returns Created GradingDocument.
     *
     * @throws `BadRequestException` - If any of the ExerciseGradingDTO could not be converted {@link ExerciseGradingModel#fromDTO}.
     */
    static fromDTO(dto: GradingDTO): Grading {
        const grading = new Grading();
        grading.updateFromDTO(dto);

        return grading;
    }

    /**
     * Updates the documents information according to the given DTO.
     *
     * @param dto DTO to update the document with.
     *
     * @throws `BadRequestException` - If any of the inner ExerciseGradingDTOs could not be converted {@link ExerciseGradingModel#fromDTO}.
     */
    updateFromDTO(dto: GradingDTO): void {
        const { exerciseGradings, additionalPoints, comment, sheetId, examId, shortTestId } = dto;

        if (!sheetId && !examId && !shortTestId) {
            throw new Error(
                'Either the sheetId or the examId or the shortTestId has to be provided through the DTO.'
            );
        }

        this.sheetId = sheetId;
        this.examId = examId;
        this.shortTestId = shortTestId;
        this.comment = comment;
        this.additionalPoints = additionalPoints;
        this.exerciseGradings = new SerializableMap();

        for (const [key, exerciseGradingDTO] of exerciseGradings) {
            this.exerciseGradings.set(key, ExerciseGrading.fromDTO(exerciseGradingDTO));
        }
    }

    toDTO(): IGrading {
        const { id, comment, additionalPoints, points, belongsToTeam } = this;
        const exerciseGradings: Map<string, IExerciseGrading> = new Map();

        for (const [key, exGrading] of this.exerciseGradings) {
            exerciseGradings.set(key, exGrading.toDTO());
        }

        return {
            id,
            points,
            belongsToTeam,
            exerciseGradings: [...exerciseGradings],
            comment,
            additionalPoints,
        };
    }

    getExerciseGrading(exercise: ExerciseDocument): ExerciseGrading | undefined {
        return this.exerciseGradings.get(exercise.id);
    }

    private assertOnlyOneIdIsSet() {
        const ids = [this.sheetId, this.examId, this.shortTestId].filter(Boolean);

        if (ids.length >= 2) {
            throw new Error(
                'Multiple of the fields "sheetId", "examId" and "shortTestId" are set. This is not a valid model state.'
            );
        }
    }
}
