import { Injectable, NotFoundException } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { ExerciseModel } from '../../database/models/exercise.model';
import { SheetDocument, SheetModel } from '../../database/models/sheet.model';
import { CRUDService } from '../../helpers/CRUDService';
import { Sheet } from '../../shared/model/Sheet';
import { SheetDTO } from './sheet.dto';

@Injectable()
export class SheetService implements CRUDService<Sheet, SheetDTO, SheetDocument> {
  constructor(
    @InjectModel(SheetModel)
    private readonly sheetModel: ReturnModelType<typeof SheetModel>
  ) {}

  /**
   * @returns All sheets saved in the database.
   */
  async findAll(): Promise<Sheet[]> {
    const sheets = await this.sheetModel.find().exec();

    return sheets.map(sheet => sheet.toDTO());
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
      throw new NotFoundException(`Sheet with the ID '${id} could not be found.`);
    }

    return sheet;
  }

  async create(dto: SheetDTO): Promise<Sheet> {
    const { sheetNo, bonusSheet, exercises } = dto;

    const sheet = new SheetModel({
      sheetNo,
      bonusSheet,
      exercises: exercises.map(exerciseDTO => ExerciseModel.fromDTO(exerciseDTO)),
    });

    const created = await this.sheetModel.create(sheet);

    return created.toDTO();
  }

  async update(id: string, dto: SheetDTO): Promise<Sheet> {
    throw new Error('Method not implemented.');
  }

  async delete(id: string): Promise<SheetDocument> {
    throw new Error('Method not implemented.');
  }
}
