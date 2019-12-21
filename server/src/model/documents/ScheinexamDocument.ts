import { Document, Model } from 'mongoose';
import { ScheinExam } from 'shared/dist/model/Scheinexam';
import { arrayProp, prop, Typegoose } from '@typegoose/typegoose';
import { CollectionName } from '../CollectionName';
import { ExerciseDocument, ExerciseSchema } from './ExerciseDocument';

export class ScheinexamSchema extends Typegoose implements Omit<ScheinExam, 'id'> {
  @prop({ required: true })
  scheinExamNo!: number;

  @prop({ required: true })
  date!: Date;

  @arrayProp({ required: true, items: ExerciseSchema })
  exercises!: ExerciseDocument[];

  @prop({ required: true })
  percentageNeeded!: number;
}

export interface ScheinexamDocument extends ScheinexamSchema, Document {}

const ScheinexamModel: Model<ScheinexamDocument> = new ScheinexamSchema().getModelForClass(
  ScheinexamSchema,
  { schemaOptions: { collection: CollectionName.SCHEINEXAM } }
);

export default ScheinexamModel;
