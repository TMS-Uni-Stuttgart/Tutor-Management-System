import { Document, Model } from 'mongoose';
import { Sheet } from 'shared/dist/model/Sheet';
import { arrayProp, prop, Typegoose } from 'typegoose';
import { CollectionName } from '../CollectionName';
import { ExerciseDocument, ExerciseSchema } from './ExerciseDocument';

export class SheetSchema extends Typegoose implements Omit<Sheet, 'id'> {
  @prop({ required: true })
  sheetNo!: number;

  @prop({ required: true })
  bonusSheet!: boolean;

  @arrayProp({ required: true, items: ExerciseSchema })
  exercises!: ExerciseDocument[];
}

export interface SheetDocument extends SheetSchema, Document {}

const SheetModel: Model<SheetDocument> = new SheetSchema().getModelForClass(SheetSchema, {
  schemaOptions: { collection: CollectionName.SHEET },
});

export default SheetModel;
