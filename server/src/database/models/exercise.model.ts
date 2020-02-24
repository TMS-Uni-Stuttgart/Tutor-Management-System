import { DocumentType, prop } from '@typegoose/typegoose';

export class SubexerciseModel {
  @prop({ required: true })
  exName!: string;

  @prop({ required: true })
  bonus!: boolean;

  @prop({ required: true })
  maxPoints!: number;
}

export class ExerciseModel extends SubexerciseModel {
  @prop({ ref: SubexerciseModel, default: [] })
  subexercises!: ExerciseDocument[];
}

export type ExerciseDocument = DocumentType<ExerciseModel>;
