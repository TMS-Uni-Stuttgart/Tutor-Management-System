import { arrayProp, DocumentType, getModelForClass, prop } from '@typegoose/typegoose';
import { Model } from 'mongoose';
import { ScheinExam } from 'shared/dist/model/Scheinexam';
import { CollectionName } from '../CollectionName';
import { ExerciseDocument, ExerciseSchema } from './ExerciseDocument';

export class ScheinexamSchema implements Omit<ScheinExam, 'id'> {
  @prop({ required: true })
  scheinExamNo!: number;

  @prop({ required: true })
  date!: Date;

  @arrayProp({ required: true, items: ExerciseSchema })
  exercises!: ExerciseDocument[];

  @prop({ required: true })
  percentageNeeded!: number;
}

export type ScheinexamDocument = DocumentType<ScheinexamSchema>;

const ScheinexamModel: Model<ScheinexamDocument> = getModelForClass(ScheinexamSchema, {
  schemaOptions: { collection: CollectionName.SCHEINEXAM },
});

export default ScheinexamModel;
