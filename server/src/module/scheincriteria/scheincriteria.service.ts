import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { validateSync } from 'class-validator';
import { InjectModel } from 'nestjs-typegoose';
import {
  ScheincriteriaDocument,
  ScheincriteriaModel,
} from '../../database/models/scheincriteria.model';
import { CRUDService } from '../../helpers/CRUDService';
import { ScheinCriteriaResponse } from '../../shared/model/ScheinCriteria';
import { Scheincriteria } from './container/Scheincriteria';
import { ScheincriteriaContainer } from './container/scheincriteria.container';
import { ScheinCriteriaDTO } from './scheincriteria.dto';

@Injectable()
export class ScheincriteriaService
  implements CRUDService<ScheinCriteriaResponse, ScheinCriteriaDTO, ScheincriteriaDocument> {
  constructor(
    @InjectModel(ScheincriteriaModel)
    private readonly scheincriteriaModel: ReturnModelType<typeof ScheincriteriaModel>
  ) {}

  /**
   * @returns All scheincriterias saved in the database.
   */
  async findAll(): Promise<ScheinCriteriaResponse[]> {
    const criterias = await this.scheincriteriaModel.find().exec();

    return criterias.map(criteria => criteria.toDTO());
  }

  /**
   * Searches for and returns the scheincriteria with the given ID.
   *
   * @param id ID to search for.
   *
   * @returns ScheincriteriaDocument with the given ID.
   *
   * @throws `NotFoundException` - If no scheincriteria could be found with the given ID.
   */
  async findById(id: string): Promise<ScheincriteriaDocument> {
    const criteria = await this.scheincriteriaModel.findById(id).exec();

    if (!criteria) {
      throw new NotFoundException(`No scheincriteria with the ID '${id}' could be found.`);
    }

    return criteria;
  }

  /**
   * Creates a new scheincriteria from the given DTO and returns the created one.
   *
   * @param dto DTO to create a criteria from.
   *
   * @returns The created scheincriteria
   *
   * @throws `NotFoundException` - If no scheincriteria could be generated with the provided identifier in the DTO.
   * @throws `BadRequestException` - If the provided data is not a valid criteria.
   */
  async create(dto: ScheinCriteriaDTO): Promise<ScheinCriteriaResponse> {
    const scheincriteria = this.generateCriteriaFromDTO(dto);
    const document = {
      name: dto.name,
      criteria: scheincriteria,
    };

    const createdCriteria = await this.scheincriteriaModel.create(document);

    return createdCriteria.toDTO();
  }

  /**
   * Updates the scheincriteria with the given ID and returns the updated version.
   *
   * @param id ID of the scheincriteria to update.
   * @param dto Data to update the scheincriteria with.
   *
   * @returns Updated version of the scheincriteria.
   *
   * @throws `NotFoundException` - If there is no scheincriteria saved with the given ID or if no scheincriteria could be generated from the given DTO.
   * @throws `BadRequestException` - If the provided data is not a valid criteria.
   */
  async update(id: string, dto: ScheinCriteriaDTO): Promise<ScheinCriteriaResponse> {
    const scheincriteria = await this.findById(id);

    scheincriteria.criteria = this.generateCriteriaFromDTO(dto);
    scheincriteria.name = dto.name;

    const updatedCriteria = await scheincriteria.save();

    return updatedCriteria.toDTO();
  }

  private generateCriteriaFromDTO({ identifier, data }: ScheinCriteriaDTO): Scheincriteria {
    const bluePrintData = ScheincriteriaContainer.getContainer().getBluePrint(identifier);

    // Get the constructor of the blueprint. The type needs to be set here because 'constructor' is only typed as 'Function' and therefore cannot be used with 'new' in front of it.
    const prototype = bluePrintData.blueprint.constructor as new () => Scheincriteria;
    const criteria: Scheincriteria = Object.assign(new prototype(), data);

    const errors = validateSync(criteria, { whitelist: true, forbidNonWhitelisted: true });

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return criteria;
  }

  /**
   * Deletes the scheincriteria with the given ID if there is one.
   *
   * @param id ID of the scheincriteria to delete.
   *
   * @returns Deleted ScheincriteriaDocument.
   *
   * @throws `NotFoundException` - If no scheincriteria with the given ID could be found.
   */
  async delete(id: string): Promise<ScheincriteriaDocument> {
    const criteria = await this.findById(id);

    return criteria.remove();
  }
}
