import { DocumentType, modelOptions, plugin, prop } from '@typegoose/typegoose';
import { DateTime } from 'luxon';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { CollectionName } from '../../helpers/CollectionName';
import { ScheinexamDTO } from '../../module/scheinexam/scheinexam.dto';
import { IScheinExam } from '../../shared/model/Scheinexam';
import { RatedEntityModel } from './ratedEntity.model';

@plugin(mongooseAutoPopulate)
@modelOptions({ schemaOptions: { collection: CollectionName.SCHEINEXAM } })
export class ScheinexamModel extends RatedEntityModel {
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

  static fromDTO(dto: ScheinexamDTO): ScheinexamModel {
    return ScheinexamModel.assignScheinexamDTO(new ScheinexamModel(), dto);
  }

  private static assignScheinexamDTO(model: ScheinexamModel, dto: ScheinexamDTO): ScheinexamModel {
    RatedEntityModel.assignDTO(model, dto);

    const { date, scheinExamNo } = dto;

    model.scheinExamNo = scheinExamNo;
    model.date = DateTime.fromISO(date);

    return model;
  }

  /**
   * Updates this document with the information provided by the given DTO.
   *
   * @param dto DTO with the new information.
   *
   * @returns `This` document for chaining abilities.
   */
  updateFromDTO(this: ScheinexamDocument, dto: ScheinexamDTO): ScheinexamDocument {
    return ScheinexamModel.assignScheinexamDTO(this, dto) as ScheinexamDocument;
  }

  toDTO(this: ScheinexamDocument): IScheinExam {
    const rated = super.toDTO.bind(this)();

    return {
      ...rated,
      scheinExamNo: this.scheinExamNo,
      date: this.date.toISODate() ?? 'DATE_NOT_PARSEABLE',
    };
  }
}

export type ScheinexamDocument = DocumentType<ScheinexamModel>;
