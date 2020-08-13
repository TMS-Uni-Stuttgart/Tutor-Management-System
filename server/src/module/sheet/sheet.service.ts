import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { ExerciseDocument, ExerciseModel } from '../../database/models/exercise.model';
import { SheetModel } from '../../database/models/sheet.model';
import { CRUD } from '../../helpers/CRUDService';
import { ISheet } from '../../shared/model/Sheet';
import { SheetDTO } from './sheet.dto';

@Injectable()
export class SheetService extends CRUD<ISheet, SheetDTO> {
  constructor(
    @InjectModel(SheetModel)
    private readonly sheetModel: ReturnModelType<typeof SheetModel>
  ) {
    super(sheetModel);
  }

  /**
   * Checks if there is a sheet with the given ID. If not, an exception is thrown.
   *
   * @param id ID to search for.
   *
   * @throws `NotFoundException` - If no sheet with the given ID could be found.
   */
  async hasSheetWithId(id: string): Promise<void> {
    await this.findById(id);
  }

  /**
   * Updates the sheet with the given ID and the given information.
   *
   * The sheet will be saved and the updated version will be returned in the end.
   *
   * @param id ID of the sheet to update.
   * @param dto Information to update the sheet with.
   *
   * @returns The updated sheet.
   *
   * @throws `NotFoundException` - If there is no sheet available with the given ID.
   */
  async update(id: string, dto: SheetDTO): Promise<ISheet> {
    const sheet = await this.findById(id);

    sheet.sheetNo = dto.sheetNo;
    sheet.bonusSheet = dto.bonusSheet;
    sheet.exercises = dto.exercises.map((ex) => ExerciseModel.fromDTO(ex) as ExerciseDocument);

    const updated = await sheet.save();

    return updated.toDTO();
  }
}
