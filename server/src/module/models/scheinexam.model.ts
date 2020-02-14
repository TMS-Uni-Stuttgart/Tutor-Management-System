import { DocumentType, modelOptions, plugin, prop, arrayProp } from '@typegoose/typegoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { CollectionName } from '../../helpers/CollectionName';
import { ExerciseModel, ExerciseDocument } from './exercise.model';

// TODO: If not needed remove the plugin.
@plugin(mongooseAutoPopulate)
@modelOptions({ schemaOptions: { collection: CollectionName.SCHEINEXAM } })
export class ScheinexamModel {
  @prop({ required: true })
  scheinexamNo!: number;

  @prop({ required: true })
  date!: Date;

  @arrayProp({ ref: ExerciseModel, autopopulate: true, default: [] })
  exercises!: ExerciseDocument[];

  @prop({ required: true })
  percentageNeeded!: number;
}

export type ScheinexamDocument = DocumentType<ScheinexamModel>;
