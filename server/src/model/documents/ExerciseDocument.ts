import { Document, Model } from 'mongoose';
import { Exercise } from 'shared/dist/model/Sheet';
import { prop, Typegoose } from 'typegoose';

export class ExerciseSchema extends Typegoose implements Exercise {
  @prop({ required: true })
  exNo!: number;

  @prop({ required: true })
  bonus!: boolean;

  @prop({ required: true })
  maxPoints!: number;
}

export interface ExerciseDocument extends ExerciseSchema, Document {}

export function convertDocumentToExercise(doc: ExerciseDocument): Exercise {
  const { exNo, bonus, maxPoints } = doc;

  return { exNo, bonus, maxPoints };
}

const ExerciseModel: Model<ExerciseDocument> = new ExerciseSchema().getModelForClass(
  ExerciseSchema
);

export default ExerciseModel;
