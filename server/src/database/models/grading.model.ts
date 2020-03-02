import { DocumentType, mapProp, modelOptions, prop, getModelForClass } from '@typegoose/typegoose';
import { GradingDTO } from '../../module/student/student.dto';
import { NoFunctions } from '../../helpers/NoFunctions';
import { BadRequestException } from '@nestjs/common';
import { Grading } from '../../shared/model/Points';
import { CollectionName } from '../../helpers/CollectionName';

@modelOptions({ schemaOptions: { collection: CollectionName.GRADING } })
export class GradingModel {
  constructor({ points, additionalPoints, comment, subExercisePoints }: NoFunctions<GradingModel>) {
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
   * Converts the given DTO into a grading document.
   *
   * The DTO must hold either a `points` property or a `subExercisePoints` property. Otherwise an exception is thrown.
   *
   * If the DTO contains a `gradingId` propery the `id` of the generated document will be set to this ID.
   *
   * @param dto DTO to convert to a document.
   *
   * @returns GradingDocument generated from the DTO.
   *
   * @throws `BadRequestException` - If neither the `points` nor the `subExercisePoints` property is set.
   */
  static fromDTO(dto: GradingDTO): GradingDocument {
    const { gradingId, additionalPoints, comment, points, subExercisePoints } = dto;

    if (!points && !subExercisePoints) {
      throw new BadRequestException(
        `At least one of the two properties 'points' and 'subExercisePoints' has to be set in the DTO.`
      );
    }

    const model = getModelForClass(GradingModel);
    const grading = new GradingModel({
      comment,
      additionalPoints,
      points: points ?? 0,
      subExercisePoints: subExercisePoints ? new Map(subExercisePoints) : undefined,
    });
    const doc = new model(grading);

    if (gradingId) {
      doc.id = gradingId;
    }

    return doc;
  }

  toDTO(this: GradingDocument): Grading {
    const { comment, additionalPoints, points, subExercisePoints } = this;

    return {
      comment,
      additionalPoints,
      points,
      subExercisePoints: subExercisePoints ? [...subExercisePoints] : undefined,
    };
  }
}

export type GradingDocument = DocumentType<GradingModel>;
