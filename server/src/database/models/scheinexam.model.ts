import { DocumentType, modelOptions, plugin, prop } from '@typegoose/typegoose';
import { DateTime } from 'luxon';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { CollectionName } from '../../helpers/CollectionName';
import { ScheinexamDTO } from '../../module/scheinexam/scheinexam.dto';
import { ExercisePointInfo } from '../../shared/model/Points';
import { IScheinExam } from '../../shared/model/Scheinexam';
import { ExerciseDocument, ExerciseModel } from './exercise.model';
import { StudentDocument } from './student.model';

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
    const parsed = date.toISODate();

    if (!!parsed) {
      this._date = parsed;
    }
  }

  @prop({ required: true, type: ExerciseModel })
  exercises!: ExerciseDocument[];

  @prop({ required: true })
  percentageNeeded!: number;

  get totalPoints(): ExercisePointInfo {
    return this.exercises.reduce(
      (sum, current: ExerciseDocument) => {
        const ptInfoEx = current.pointInfo;

        return {
          must: sum.must + ptInfoEx.must,
          bonus: sum.bonus + ptInfoEx.bonus,
        };
      },
      { must: 0, bonus: 0 }
    );
  }

  static fromDTO(dto: ScheinexamDTO): ScheinexamModel {
    return this.assignDTO(new ScheinexamModel(), dto);
  }

  private static assignDTO(model: ScheinexamModel, dto: ScheinexamDTO): ScheinexamModel {
    const { date, exercises, percentageNeeded, scheinExamNo } = dto;

    model.scheinExamNo = scheinExamNo;
    model.percentageNeeded = percentageNeeded;
    model.date = DateTime.fromISO(date);
    model.exercises = exercises.map((ex) => ExerciseModel.fromDTO(ex) as ExerciseDocument);

    return model;
  }

  hasPassed(this: ScheinexamDocument, student: StudentDocument): PassedInformation {
    const total = this.totalPoints;
    const grading = student.getGrading(this);

    if (!grading) {
      return { passed: false, achieved: 0, total };
    }

    const achieved = grading.points;

    return {
      passed: achieved / total.must >= this.percentageNeeded,
      achieved,
      total,
    };
  }

  /**
   * Updates this document with the information provided by the given DTO.
   *
   * @param dto DTO with the new information.
   *
   * @returns `This` document for chaining abilities.
   */
  updateFromDTO(this: ScheinexamDocument, dto: ScheinexamDTO): ScheinexamDocument {
    return ScheinexamModel.assignDTO(this, dto) as ScheinexamDocument;
  }

  toDTO(this: ScheinexamDocument): IScheinExam {
    return {
      id: this.id,
      scheinExamNo: this.scheinExamNo,
      percentageNeeded: this.percentageNeeded,
      date: this.date.toISODate() ?? 'DATE_NOT_PARSEABLE',
      exercises: this.exercises.map((ex) => ex.toDTO()),
    };
  }
}

export type ScheinexamDocument = DocumentType<ScheinexamModel>;
