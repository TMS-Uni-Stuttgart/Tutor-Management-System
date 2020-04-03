import { Injectable, NotFoundException } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { ExerciseModel, ExerciseDocument } from '../../database/models/exercise.model';
import { SheetDocument, SheetModel } from '../../database/models/sheet.model';
import { CRUDService } from '../../helpers/CRUDService';
import { ISheet } from '../../shared/model/Sheet';
import { SheetDTO } from './sheet.dto';

@Injectable()
export class SheetService implements CRUDService<ISheet, SheetDTO, SheetDocument> {
  constructor(
    @InjectModel(SheetModel)
    private readonly sheetModel: ReturnModelType<typeof SheetModel>
  ) {}

  /**
   * @returns All sheets saved in the database.
   */
  async findAll(): Promise<SheetDocument[]> {
    const sheets = await this.sheetModel.find().exec();

    return sheets;
  }

  /**
   * Searches for a sheet with the given ID and returns it.
   *
   * @param id ID to search for.
   *
   * @returns SheetDocument with the given ID.
   *
   * @throws `NotFoundException` - If no sheet with the given ID could be found.
   */
  async findById(id: string): Promise<SheetDocument> {
    const sheet: SheetDocument | null = await this.sheetModel.findById(id).exec();

    if (!sheet) {
      throw new NotFoundException(`Sheet with the ID '${id}' could not be found.`);
    }

    return sheet;
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
   * Creates a new sheet from the given information and saves it to the database. The created sheet is returned.
   *
   * @param dto Information to create a sheet with.
   *
   * @returns Created sheet.
   */
  async create(dto: SheetDTO): Promise<ISheet> {
    const { sheetNo, bonusSheet, exercises } = dto;

    const sheet = new SheetModel({
      sheetNo,
      bonusSheet,
      exercises: exercises.map((exerciseDTO) => ExerciseModel.fromDTO(exerciseDTO)),
    });

    const created = await this.sheetModel.create(sheet);

    return created.toDTO();
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

  /**
   * Deletes the sheet with the given ID, if available, and returns the deleted document.
   *
   * @param id ID of the sheet to delete
   *
   * @returns Document of the deleted sheet.
   *
   * @throws `NotFoundException` - If no sheet with the given ID could be found.
   */
  async delete(id: string): Promise<SheetDocument> {
    const sheet = await this.findById(id);

    return sheet.remove();
  }
}
