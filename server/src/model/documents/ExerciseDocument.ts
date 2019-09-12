import { Document, Model, Types } from 'mongoose';
import { Exercise, ExerciseDTO } from 'shared/dist/model/Sheet';
import { prop, Typegoose, arrayProp } from 'typegoose';

export class ExerciseSchema extends Typegoose implements Omit<Exercise, 'subexercises'> {
  @prop({ required: true })
  exName!: string;

  @prop({ required: true })
  bonus!: boolean;

  @prop({ required: true })
  private _maxPoints!: number;

  @arrayProp({ items: ExerciseSchema, default: [] })
  subexercises!: Types.Array<ExerciseDocument>;

  @prop()
  get maxPoints() {
    if (this.subexercises.length === 0) {
      return this._maxPoints;
    }

    return this.subexercises.reduce((pts, subEx) => pts + subEx.maxPoints, 0);
  }
  set maxPoints(pts: number) {
    this._maxPoints = pts;
  }
}

export interface ExerciseDocument extends ExerciseSchema, Document {}

const ExerciseModel: Model<ExerciseDocument> = new ExerciseSchema().getModelForClass(
  ExerciseSchema
);

export function convertDocumentToExercise(doc: ExerciseDocument): Exercise {
  const { exName, bonus, maxPoints, subexercises } = doc;

  return {
    exName,
    bonus,
    maxPoints,
    subexercises: subexercises.map(doc => convertDocumentToExercise(doc)),
  };
}

export function generateExerciseDocumentsFromDTOs(
  dtos: ExerciseDTO[],
  isBonus: boolean = false
): ExerciseDocument[] {
  const exercises: ExerciseDocument[] = [];

  dtos.forEach(({ exName, bonus, maxPoints }) => {
    exercises.push(new ExerciseModel({ exName, maxPoints, bonus: isBonus || bonus }));
  });

  return exercises;
}
