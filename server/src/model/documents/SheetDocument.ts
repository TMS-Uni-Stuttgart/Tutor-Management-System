import { arrayProp, DocumentType, getModelForClass, prop } from '@typegoose/typegoose';
import { Model } from 'mongoose';
import { Sheet } from 'shared/dist/model/Sheet';
import { CollectionName } from '../CollectionName';
import { ExerciseDocument, ExerciseSchema } from './ExerciseDocument';

export class SheetSchema implements Omit<Sheet, 'id'> {
  @prop({ required: true })
  sheetNo!: number;

  @prop({ required: true })
  bonusSheet!: boolean;

  @arrayProp({ required: true, items: ExerciseSchema })
  exercises!: ExerciseDocument[];
}

export type SheetDocument = DocumentType<SheetSchema>;

const SheetModel: Model<SheetDocument> = getModelForClass(SheetSchema, {
  schemaOptions: { collection: CollectionName.SHEET },
});

export default SheetModel;
