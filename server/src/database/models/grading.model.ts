import { BadRequestException } from '@nestjs/common';
import { DocumentType, getModelForClass, modelOptions, plugin, prop } from '@typegoose/typegoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { fieldEncryption } from 'mongoose-field-encryption';
import { CollectionName } from '../../helpers/CollectionName';
import { StaticSettings } from '../../module/settings/settings.static';
import { ExerciseGradingDTO, GradingDTO } from '../../module/student/student.dto';
import { IExerciseGrading, IGrading } from '../../shared/model/Gradings';
import { ExerciseDocument, SubExerciseDocument } from './exercise.model';
import { StudentDocument } from './student.model';

export class ExerciseGradingModel {
  constructor({ points }: { points: number }) {
    this.points = points;
  }

  @prop()
  comment?: string;

  @prop()
  additionalPoints?: number;

  @prop({ default: 0 })
  private _points!: number;

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

  @prop({ type: Number })
  subExercisePoints?: Map<string, number>;

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
  static fromDTO(dto: ExerciseGradingDTO): ExerciseGradingDocument {
    const model = getModelForClass(ExerciseGradingModel);
    const grading = new ExerciseGradingModel({ points: 0 });
    const doc = new model(grading);

    doc.updateFromDTO(dto);

    return doc;
  }

  /**
   * Updates the documents information according to the given DTO.
   * The DTO must hold either a `points` property or a `subExercisePoints` property. Otherwise an exception is thrown.
   *
   * @param dto DTO to update the document with.
   *
   * @throws `BadRequestException` - If neither the `points` nor the `subExercisePoints` property is set.
   */
  private updateFromDTO(this: ExerciseGradingDocument, dto: ExerciseGradingDTO) {
    const { additionalPoints, comment, points, subExercisePoints } = dto;

    if (points === undefined && subExercisePoints === undefined) {
      throw new BadRequestException(
        `At least one of the two properties 'points' and 'subExercisePoints' has to be set in the DTO.`
      );
    }

    this.comment = comment;
    this.additionalPoints = additionalPoints;
    this.points = points ?? 0;
    this.subExercisePoints = !!subExercisePoints ? new Map(subExercisePoints) : undefined;
  }

  toDTO(this: ExerciseGradingDocument): IExerciseGrading {
    const { comment, additionalPoints, points, subExercisePoints } = this;

    return {
      comment,
      additionalPoints,
      points,
      subExercisePoints: subExercisePoints ? [...subExercisePoints] : undefined,
    };
  }
}

@modelOptions({ schemaOptions: { collection: CollectionName.GRADING } })
@plugin(fieldEncryption, {
  secret: StaticSettings.getService().getDatabaseSecret(),
  fields: ['comment', 'additionalPoints', 'exerciseGradings'],
})
@plugin(mongooseAutoPopulate)
export class GradingModel {
  @prop({ type: ExerciseGradingModel, autopopulate: true, default: new Map() })
  exerciseGradings!: Map<string, ExerciseGradingDocument>;

  @prop()
  comment?: string;

  @prop()
  additionalPoints?: number;

  @prop({ default: [] })
  students!: string[];

  @prop()
  sheetId?: string;

  @prop()
  examId?: string;

  @prop()
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
    this.exerciseGradings = new Map();
  }

  /**
   * Adds a student to this grading to "use" it.
   *
   * If the student got added, the 'students' path is marked as modified. If the student is already using it, nothing happens.
   *
   * @param student Student to add to this grading.
   */
  addStudent(this: GradingDocument, student: StudentDocument): void {
    const idx = this.students.findIndex((studentId) => studentId === student.id);

    if (idx === -1) {
      this.students.push(student.id);
      this.markModified('students');
    }
  }

  /**
   * Removes the student from 'using' this grading.
   *
   * If the student got removed, the 'students' path is marked as modified. If the student has NOT used this grading, nothing happens.
   *
   * @param student Student to remove.
   */
  removeStudent(this: GradingDocument, student: StudentDocument): void {
    const idx = this.students.findIndex((studentId) => studentId === student.id);

    if (idx !== -1) {
      this.students.splice(idx, 1);
      this.markModified('students');
    }
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
  static fromDTO(dto: GradingDTO): GradingDocument {
    const model = getModelForClass(GradingModel);
    const grading = new GradingModel();
    const doc = new model(grading);

    doc.updateFromDTO(dto);

    return doc;
  }

  /**
   * Updates the documents information according to the given DTO.
   *
   * @param dto DTO to update the document with.
   *
   * @throws `BadRequestException` - If any of the inner ExerciseGradingDTOs could not be converted {@link ExerciseGradingModel#fromDTO}.
   */
  updateFromDTO(this: GradingDocument, dto: GradingDTO): void {
    const {
      exerciseGradings,
      additionalPoints,
      comment,
      gradingId,
      sheetId,
      examId,
      shortTestId,
    } = dto;

    if (!!gradingId) {
      this.id = gradingId;
    }

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
    this.exerciseGradings = new Map();

    for (const [key, exerciseGradingDTO] of exerciseGradings) {
      this.exerciseGradings.set(key, ExerciseGradingModel.fromDTO(exerciseGradingDTO));
    }
  }

  toDTO(this: GradingDocument): IGrading {
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

  getExerciseGrading(exercise: ExerciseDocument): ExerciseGradingDocument | undefined {
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

export type ExerciseGradingDocument = DocumentType<ExerciseGradingModel>;
export type GradingDocument = DocumentType<GradingModel>;
