import { Document, Model, Types } from 'mongoose';
import { Exercise, ExerciseDTO } from 'shared/dist/model/Sheet';
import { prop, Typegoose, arrayProp } from 'typegoose';
import { getPointsOfExercise } from 'shared/dist/model/Points';
import { ObjectID } from 'bson';

export class ExerciseSchema extends Typegoose implements Omit<Exercise, 'id' | 'subexercises'> {
  @prop({ required: true })
  exName!: string;

  @prop({ required: true })
  bonus!: boolean;

  @prop({ required: true })
  maxPoints!: number;

  @arrayProp({ items: ExerciseSchema, default: [] })
  subexercises!: Types.Array<ExerciseDocument>;
}

export interface ExerciseDocument extends ExerciseSchema, Document {}

export const ExerciseModel: Model<ExerciseDocument> = new ExerciseSchema().getModelForClass(
  ExerciseSchema
);

export function convertDocumentToExercise(doc: ExerciseDocument): Exercise {
  const { id, exName, bonus, subexercises } = doc;

  return {
    id,
    exName,
    bonus,
    maxPoints: getPointsOfExercise(doc),
    subexercises: subexercises.map(doc => convertDocumentToExercise(doc)),
  };
}

export function generateExerciseDocumentsFromDTOs(
  dtos: ExerciseDTO[],
  isBonus: boolean = false
): ExerciseDocument[] {
  const exercises: ExerciseDocument[] = [];

  dtos.forEach(({ id, exName, bonus, maxPoints, subexercises }) => {
    const subDocs = generateExerciseDocumentsFromDTOs(subexercises, isBonus || bonus);

    exercises.push(
      new ExerciseModel({
        _id: new ObjectID(id),
        exName,
        maxPoints,
        bonus: isBonus || bonus,
        subexercises: subDocs,
      })
    );
  });

  return exercises;
}
