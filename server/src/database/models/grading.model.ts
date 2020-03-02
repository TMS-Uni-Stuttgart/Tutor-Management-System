import { BadRequestException } from '@nestjs/common';
import { DocumentType, getModelForClass, mapProp, modelOptions, prop } from '@typegoose/typegoose';
import { CollectionName } from '../../helpers/CollectionName';
import { NoFunctions } from '../../helpers/NoFunctions';
import { ExerciseGradingDTO, GradingDTO } from '../../module/student/student.dto';
import { ExerciseGrading, Grading } from '../../shared/model/Points';

export class ExerciseGradingModel {
  constructor({
    points,
    additionalPoints,
    comment,
    subExercisePoints,
  }: NoFunctions<ExerciseGradingModel>) {
    this.points = points;
    this.additionalPoints = additionalPoints;
    this.comment = comment;
    this.subExercisePoints = subExercisePoints;
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

    this.subExercisePoints.forEach(value => {
      sum += value;
    });

    return sum + addPoints;
  }

  set points(newPoints: number) {
    this._points = newPoints;
  }

  @mapProp({ of: Number })
  subExercisePoints?: Map<string, number>;

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

    if (!points && !subExercisePoints) {
      throw new BadRequestException(
        `At least one of the two properties 'points' and 'subExercisePoints' has to be set in the DTO.`
      );
    }

    this.comment = comment;
    this.additionalPoints = additionalPoints;
    this.points = points ?? 0;
    this.subExercisePoints = subExercisePoints ? new Map(subExercisePoints) : undefined;
  }

  toDTO(this: ExerciseGradingDocument): ExerciseGrading {
    const { id, comment, additionalPoints, points, subExercisePoints } = this;

    return {
      gradingId: id,
      comment,
      additionalPoints,
      points,
      subExercisePoints: subExercisePoints ? [...subExercisePoints] : undefined,
    };
  }
}

@modelOptions({ schemaOptions: { collection: CollectionName.GRADING } })
export class GradingModel {
  constructor() {
    this.exerciseGradings = new Map();
  }

  @prop()
  comment?: string;

  @prop()
  additionalPoints?: number;

  @mapProp({ of: ExerciseGradingModel, autopopulate: true, default: new Map() })
  exerciseGradings!: Map<string, ExerciseGradingDocument>;

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
  updateFromDTO(this: GradingDocument, dto: GradingDTO) {
    const { exerciseGradings, additionalPoints, comment, gradingId } = dto;

    if (!!gradingId) {
      this.id = gradingId;
    }

    this.comment = comment;
    this.additionalPoints = additionalPoints;
    this.exerciseGradings = new Map();

    for (const [key, exerciseGradingDTO] of exerciseGradings) {
      this.exerciseGradings.set(key, ExerciseGradingModel.fromDTO(exerciseGradingDTO));
    }
  }

  toDTO(this: GradingDocument): Grading {
    const { id, comment, additionalPoints, points } = this;
    const exerciseGradings: Map<string, ExerciseGrading> = new Map();

    for (const [key, exGrading] of this.exerciseGradings) {
      exerciseGradings.set(key, exGrading.toDTO());
    }

    return {
      id,
      points,
      exerciseGradings: [...exerciseGradings],
      comment,
      additionalPoints,
    };
  }
}

export type ExerciseGradingDocument = DocumentType<ExerciseGradingModel>;
export type GradingDocument = DocumentType<GradingModel>;
