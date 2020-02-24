import { DocumentType, modelOptions, plugin, prop, arrayProp } from '@typegoose/typegoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { CollectionName } from '../../helpers/CollectionName';
import { ExerciseModel, ExerciseDocument } from './exercise.model';

@plugin(mongooseAutoPopulate)
@modelOptions({ schemaOptions: { collection: CollectionName.SHEET } })
export class SheetModel {
  @prop({ required: true })
  sheetNo!: number;

  @prop({ required: true })
  bonusSheet!: boolean;

  @arrayProp({ required: true, ref: ExerciseModel })
  exercises!: ExerciseDocument[];
}

export type SheetDocument = DocumentType<SheetModel>;
