import { arrayProp, DocumentType, modelOptions, plugin, prop } from '@typegoose/typegoose';
import { DateTime } from 'luxon';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { CollectionName } from '../../helpers/CollectionName';
import { ScheinExamDTO } from '../../module/scheinexam/scheinexam.dto';
import { ScheinExam } from '../../shared/model/Scheinexam';
import { ExerciseDocument, ExerciseModel } from './exercise.model';
import { StudentDocument } from './student.model';
import { ExercisePointInfo } from '../../shared/model/Points';

interface PassedInformation {
  passed: boolean;
  achieved: number;
  total: ExercisePointInfo;
}

@plugin(mongooseAutoPopulate)
@modelOptions({ schemaOptions: { collection: CollectionName.SCHEINEXAM } })
export class ScheinexamModel {
  @prop({ required: true })
  scheinExamNo!: number;

  @prop({ required: true })
  private _date!: string;

  get date(): DateTime {
    return DateTime.fromISO(this._date);
  }

  set date(date: DateTime) {
    this._date = date.toISODate();
  }

  @arrayProp({ required: true, items: ExerciseModel })
  exercises!: ExerciseDocument[];

  @prop({ required: true })
  percentageNeeded!: number;

  static fromDTO(dto: ScheinExamDTO) {
    return this.assignDTO(new ScheinexamModel(), dto);
  }

  private static assignDTO(model: ScheinexamModel, dto: ScheinExamDTO): ScheinexamModel {
    const { date, exercises, percentageNeeded, scheinExamNo } = dto;

    model.scheinExamNo = scheinExamNo;
    model.percentageNeeded = percentageNeeded;
    model.date = DateTime.fromISO(date);
    model.exercises = exercises.map(ex => ExerciseModel.fromDTO(ex) as ExerciseDocument);

    return model;
  }

  hasPassed(student: StudentDocument): PassedInformation {
    throw new Error('Method not implemented');
  }

  /**
   * Updates this document with the information provided by the given DTO.
   *
   * @param dto DTO with the new information.
   *
   * @returns `This` document for chaining abilities.
   */
  updateFromDTO(this: ScheinexamDocument, dto: ScheinExamDTO): ScheinexamDocument {
    return ScheinexamModel.assignDTO(this, dto) as ScheinexamDocument;
  }

  toDTO(this: ScheinexamDocument): ScheinExam {
    return {
      id: this.id,
      scheinExamNo: this.scheinExamNo,
      percentageNeeded: this.percentageNeeded,
      date: this.date.toISODate(),
      exercises: this.exercises.map(ex => ex.toDTO()),
    };
  }
}

export type ScheinexamDocument = DocumentType<ScheinexamModel>;
