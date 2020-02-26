import { Injectable, NotFoundException } from '@nestjs/common';
import { CRUDService } from '../../helpers/CRUDService';
import { ScheinExam } from '../../shared/model/Scheinexam';
import { ScheinExamDTO } from './scheinexam.dto';
import { ScheinexamDocument, ScheinexamModel } from '../../database/models/scheinexam.model';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';

@Injectable()
export class ScheinexamService
  implements CRUDService<ScheinExam, ScheinExamDTO, ScheinexamDocument> {
  constructor(
    @InjectModel(ScheinexamModel)
    private readonly scheinexamModel: ReturnModelType<typeof ScheinexamModel>
  ) {}

  /**
   * @returns All scheinexams saved in the database.
   */
  async findAll(): Promise<ScheinExam[]> {
    const scheinexams = await this.scheinexamModel.find().exec();

    return scheinexams.map(exam => exam.toDTO());
  }

  /**
   * Searches for a scheinexam with the given ID and returns it.
   *
   * @param id ID to search for.
   *
   * @returns ScheinexamDocument with the given ID.
   *
   * @throws `NotFoundException` - If no scheinexam with the given ID could be found.
   */
  async findById(id: string): Promise<ScheinexamDocument> {
    const scheinexam = await this.scheinexamModel.findById(id).exec();

    if (!scheinexam) {
      throw new NotFoundException(`Scheinexam with the ID ${id} oculd not be found.`);
    }

    return scheinexam;
  }

  /**
   * Creates a scheinexam with the given information. Returns the created scheinexam.
   *
   * @param dto Information to create the scheinexam with.
   *
   * @returns Created scheinexam.
   */
  async create(dto: ScheinExamDTO): Promise<ScheinExam> {
    const scheinexam = ScheinexamModel.fromDTO(dto);
    const created = await this.scheinexamModel.create(scheinexam);

    return created.toDTO();
  }

  /**
   * Updates the document with the given ID with the given information.
   *
   * Afterwards it is saved to the database and the updated version is returned.
   *
   * @param id ID of the document to update.
   * @param dto Information to update the document with.
   *
   * @returns Update scheinexam.
   *
   * @throws `NotFoundException` - If no scheinexam with the given ID could be found.
   */
  async update(id: string, dto: ScheinExamDTO): Promise<ScheinExam> {
    const scheinexam = await this.findById(id);
    scheinexam.updateFromDTO(dto);

    const updated = await scheinexam.save();

    return updated.toDTO();
  }

  /**
   * Deletes the scheinexam with the given ID.
   *
   * @param id ID of the scheinexam to delete.
   *
   * @returns The deleted ScheinexamDocument.
   *
   * @throws `NotFoundException` - If no scheinexam with the given ID could be found.
   */
  async delete(id: string): Promise<ScheinexamDocument> {
    const scheinexam = await this.findById(id);

    return scheinexam.remove();
  }
}
