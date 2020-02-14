import { DocumentType, modelOptions, plugin, prop, mapProp } from '@typegoose/typegoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';

// TODO: If not needed remove the plugin.
@plugin(mongooseAutoPopulate)
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
