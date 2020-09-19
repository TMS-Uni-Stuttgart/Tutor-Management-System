import { DocumentType, modelOptions, prop } from '@typegoose/typegoose';
import { CollectionName } from '../../helpers/CollectionName';
import { ShortTestDTO } from '../../module/scheinexam/scheinexam.dto';
import { IShortTest } from '../../shared/model/ShortTest';
import { RatedEntityModel } from './ratedEntity.model';

@modelOptions({ schemaOptions: { collection: CollectionName.SHORT_TESTS } })
export class ShortTestModel extends RatedEntityModel {
  @prop({ required: true })
  shortTestNo!: number;

  static fromDTO(dto: ShortTestDTO): ShortTestModel {
    return ShortTestModel.assignShortTestDTO(new ShortTestModel(), dto);
  }

  private static assignShortTestDTO(model: ShortTestModel, dto: ShortTestDTO): ShortTestModel {
    RatedEntityModel.assignDTO(model, dto);
    model.shortTestNo = dto.shortTestNo;

    return model;
  }

  /**
   * Updates this document with the information provided by the given DTO.
   *
   * @param dto DTO with the new information.
   *
   * @returns `This` document for chaining abilities.
   */
  updateFromDTO(this: ShortTestDocument, dto: ShortTestDTO): ShortTestDocument {
    return ShortTestModel.assignShortTestDTO(this, dto) as ShortTestDocument;
  }

  toDTO(this: ShortTestDocument): IShortTest {
    const rated = super.toDTO.bind(this)();

    return {
      ...rated,
      shortTestNo: this.shortTestNo,
    };
  }
}

export type ShortTestDocument = DocumentType<ShortTestModel>;
