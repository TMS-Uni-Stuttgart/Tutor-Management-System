import { DocumentType, mapProp, modelOptions, prop } from '@typegoose/typegoose';

@modelOptions({})
export class GradingModel {
  @prop()
  comment?: string;

  @prop()
  additionalPoints?: number;

  @prop({ default: 0 })
  _points!: number;

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
}

export type GradingDocument = DocumentType<GradingModel>;
