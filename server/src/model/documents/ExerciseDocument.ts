import { arrayProp, DocumentType, getModelForClass, prop, mongoose } from '@typegoose/typegoose';
import { ObjectID } from 'bson';
import { Model, Types } from 'mongoose';
import { getPointsOfExercise } from 'shared/dist/model/Points';
import { Exercise, ExerciseDTO } from 'shared/dist/model/Sheet';

export class ExerciseSchema implements Omit<Exercise, 'id' | 'subexercises'> {
  @prop({ required: true })
  exName!: string;

  @prop({ required: true })
  bonus!: boolean;

  @prop({ required: true })
  maxPoints!: number;

  @arrayProp({ items: ExerciseSchema, default: [] })
  subexercises!: Types.Array<ExerciseDocument>;
}

export type ExerciseDocument = DocumentType<ExerciseSchema>;

export const ExerciseModel: Model<ExerciseDocument> = getModelForClass(
  ExerciseSchema
);


export function convertDocumentToExercise(doc: ExerciseDocument): Exercise {
  const { id, exName, bonus, subexercises } = doc;
  const points = getPointsOfExercise(doc);

  return {
    id,
    exName,
    bonus,
    maxPoints: points.must + points.bonus,
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
