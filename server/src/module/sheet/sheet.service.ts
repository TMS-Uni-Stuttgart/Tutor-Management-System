import { EntityRepository } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ISheet } from 'shared/model/Sheet';
import { Exercise } from '../../database/entities/ratedEntity.entity';
import { Sheet } from '../../database/entities/sheet.entity';
import { CRUDService } from '../../helpers/CRUDService';
import { SheetDTO } from './sheet.dto';

@Injectable()
export class SheetService implements CRUDService<ISheet, SheetDTO, Sheet> {
    constructor(
        @InjectRepository(Sheet)
        private readonly repository: EntityRepository<Sheet>,
        @Inject(EntityManager)
        private readonly em: EntityManager
    ) {}

    /**
     * @returns All sheets saved in the database.
     */
    async findAll(): Promise<Sheet[]> {
        return this.repository.findAll();
    }

    /**
     * Searches for a sheet with the given ID and returns it.
     *
     * @param id ID to search for.
     *
     * @returns Sheet with the given ID.
     *
     * @throws `NotFoundException` - If no sheet with the given ID could be found.
     */
    async findById(id: string): Promise<Sheet> {
        const sheet = await this.repository.findOne({ id });

        if (!sheet) {
            throw new NotFoundException(`Sheet with the ID '${id}' could not be found.`);
        }

        return sheet;
    }

    /**
     * Retrieves multiple `Sheet` entities by their IDs.
     *
     * @param ids - Array of Sheet IDs to retrieve.
     * @returns A list of `Sheet` entities.
     * @throws `NotFoundException` - If any of the requested Sheets are not found.
     */
    async findMany(ids: string[]): Promise<Sheet[]> {
        const sheets = await this.repository.find({ id: { $in: ids } });

        if (sheets.length !== ids.length) {
            const foundIds = new Set(sheets.map((sheet) => sheet.id));
            const missingIds = ids.filter((id) => !foundIds.has(id));
            throw new NotFoundException(
                `The following Sheet IDs could not be found: [${missingIds.join(', ')}]`
            );
        }

        return sheets;
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
        const sheet = Sheet.fromDTO(dto);
        await this.em.persistAndFlush(sheet);
        return sheet.toDTO();
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
        sheet.exercises = dto.exercises.map((ex) => Exercise.fromDTO(ex));

        await this.em.persistAndFlush(sheet);
        return sheet.toDTO();
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
    async delete(id: string): Promise<void> {
        const sheet = await this.findById(id);
        await this.em.removeAndFlush(sheet);
    }
}
