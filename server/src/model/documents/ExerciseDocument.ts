import { Document, Model } from 'mongoose';
import { Exercise, ExerciseDTO } from 'shared/dist/model/Sheet';
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

const ExerciseModel: Model<ExerciseDocument> = new ExerciseSchema().getModelForClass(
  ExerciseSchema
);

export function convertDocumentToExercise(doc: ExerciseDocument): Exercise {
  const { exNo, bonus, maxPoints } = doc;

  return { exNo, bonus, maxPoints };
}

export function generateExerciseDocumentsFromDTOs(
  dtos: ExerciseDTO[],
  isBonus: boolean = false
): ExerciseDocument[] {
  const exercises: ExerciseDocument[] = [];

  dtos.forEach(({ exNo, bonus, maxPoints }) => {
    exercises.push(new ExerciseModel({ exNo, maxPoints, bonus: isBonus || bonus }));
  });

  return exercises;
}
