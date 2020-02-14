import { DocumentType, mapProp, modelOptions, prop } from '@typegoose/typegoose';

@modelOptions({})
export class GradingModel {
  @prop()
  comment?: string;

  @prop()
  additionalPoints?: number;

  @prop()
  points?: number;

  @mapProp({ of: Number })
  subExercisePoints?: Map<string, number>;
}

export type GradingDocument = DocumentType<GradingModel>;
