import { arrayProp, instanceMethod, InstanceType, prop, Typegoose } from '@typegoose/typegoose';
import { Document, Model } from 'mongoose';
import { ScheinExam } from 'shared/dist/model/Scheinexam';
import { getPointsOfAllExercises, PointMap, ExercisePointInfo } from 'shared/dist/model/Points';
import { CollectionName } from '../CollectionName';
import { ExerciseDocument, ExerciseSchema } from './ExerciseDocument';
import { StudentDocument } from './StudentDocument';

interface PassedInformation {
  passed: boolean;
  achieved: number;
  total: ExercisePointInfo;
}

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
  hasPassed(this: InstanceType<ScheinexamSchema>, student: StudentDocument): PassedInformation {
    const points = new PointMap(student.scheinExamResults);
    const achieved: number = points.getSumOfPoints(this);
    const { must, bonus } = getPointsOfAllExercises(this);

    return {
      passed: achieved / must >= this.percentageNeeded,
      achieved,
      total: { must, bonus },
    };
  }
}

export interface ScheinexamDocument extends ScheinexamSchema, Document {}

const ScheinexamModel: Model<ScheinexamDocument> = new ScheinexamSchema().getModelForClass(
  ScheinexamSchema,
  { schemaOptions: { collection: CollectionName.SCHEINEXAM } }
);

export default ScheinexamModel;
