import { arrayProp, DocumentType, modelOptions, plugin, prop } from '@typegoose/typegoose';
import { DateTime } from 'luxon';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { CollectionName } from '../../helpers/CollectionName';
import { ScheinExamDTO } from '../../module/scheinexam/scheinexam.dto';
import { ScheinExam } from '../../shared/model/Scheinexam';
import { ExerciseDocument, ExerciseModel } from './exercise.model';

@plugin(mongooseAutoPopulate)
@modelOptions({ schemaOptions: { collection: CollectionName.SCHEINEXAM } })
export class ScheinexamModel {
  @prop({ required: true })
  scheinexamNo!: number;

  @prop({ required: true })
  date!: Date;

  @arrayProp({ required: true, items: ExerciseModel })
  exercises!: ExerciseDocument[];

  @prop({ required: true })
  percentageNeeded!: number;

  static fromDTO(dto: ScheinExamDTO) {
    const { date, exercises, percentageNeeded, scheinExamNo } = dto;
    const scheinexam = new ScheinexamModel();

    scheinexam.scheinexamNo = scheinExamNo;
    scheinexam.percentageNeeded = percentageNeeded;
    scheinexam.date = DateTime.fromISO(date).toJSDate();
    scheinexam.exercises = exercises.map(ex => ExerciseModel.fromDTO(ex) as ExerciseDocument);

    return scheinexam;
  }

  toDTO(this: ScheinexamDocument): ScheinExam {
    return {
      id: this.id,
      scheinExamNo: this.scheinexamNo,
      percentageNeeded: this.percentageNeeded,
      date: DateTime.fromJSDate(this.date).toISODate(),
      exercises: this.exercises.map(ex => ex.toDTO()),
    };
  }
}

export type ScheinexamDocument = DocumentType<ScheinexamModel>;
