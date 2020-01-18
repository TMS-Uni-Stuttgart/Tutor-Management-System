import { arrayProp, instanceMethod, InstanceType, prop, Typegoose } from '@typegoose/typegoose';
import { Document, Model } from 'mongoose';
import { ScheinExam } from 'shared/dist/model/Scheinexam';
import { getPointsOfAllExercises, PointMap } from 'shared/src/model/Points';
import { CollectionName } from '../CollectionName';
import { ExerciseDocument, ExerciseSchema } from './ExerciseDocument';
import { StudentDocument } from './StudentDocument';

export class ScheinexamSchema extends Typegoose implements Omit<ScheinExam, 'id'> {
  @prop({ required: true })
  scheinExamNo!: number;

  @prop({ required: true })
  date!: Date;

  @arrayProp({ required: true, items: ExerciseSchema })
  exercises!: ExerciseDocument[];

  @prop({ required: true })
  percentageNeeded!: number;

  @instanceMethod
  hasPassed(this: InstanceType<ScheinexamSchema>, student: StudentDocument): boolean {
    const points = new PointMap(student.scheinExamResults);
    const achieved: number = points.getSumOfPoints(this);
    const { must: total } = getPointsOfAllExercises(this);

    return achieved / total > this.percentageNeeded;
  }
}

export interface ScheinexamDocument extends ScheinexamSchema, Document {}

const ScheinexamModel: Model<ScheinexamDocument> = new ScheinexamSchema().getModelForClass(
  ScheinexamSchema,
  { schemaOptions: { collection: CollectionName.SCHEINEXAM } }
);

export default ScheinexamModel;
