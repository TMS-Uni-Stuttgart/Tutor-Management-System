import { DocumentType, modelOptions, plugin, prop } from '@typegoose/typegoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';

export class SubexerciseModel {
  @prop({ required: true })
  exName!: string;

  @prop({ required: true })
  bonus!: boolean;

  @prop({ required: true })
  maxPoints!: number;
}

@plugin(mongooseAutoPopulate)
@modelOptions({})
export class ExerciseModel extends SubexerciseModel {
  @prop({ ref: SubexerciseModel, autopopulate: true, default: [] })
  subexercises!: ExerciseDocument[];
}

export type ExerciseDocument = DocumentType<ExerciseModel>;
