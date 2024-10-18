import { EntityRepository } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IScheinExam } from 'shared/model/Scheinexam';
import { Scheinexam } from '../../database/entities/scheinexam.entity';
import { CRUDService } from '../../helpers/CRUDService';
import { ScheinexamDTO } from './scheinexam.dto';

@Injectable()
export class ScheinexamService implements CRUDService<IScheinExam, ScheinexamDTO, Scheinexam> {
    constructor(
        @InjectRepository(Scheinexam)
        private readonly repository: EntityRepository<Scheinexam>,
        @Inject(EntityManager)
        private readonly em: EntityManager
    ) {}

    /**
     * @returns All scheinexams saved in the database.
     */
    async findAll(): Promise<Scheinexam[]> {
        return this.repository.findAll();
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
    async findById(id: string): Promise<Scheinexam> {
        const scheinexam = await this.repository.findOne({ id });

        if (!scheinexam) {
            throw new NotFoundException(`Scheinexam with the ID ${id} could not be found.`);
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
    async create(dto: ScheinexamDTO): Promise<IScheinExam> {
        const scheinexam = Scheinexam.fromDTO(dto);
        await this.em.persistAndFlush(scheinexam);
        return scheinexam.toDTO();
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
    async update(id: string, dto: ScheinexamDTO): Promise<IScheinExam> {
        const scheinexam = await this.findById(id);
        scheinexam.updateFromDTO(dto);
        await this.em.persistAndFlush(scheinexam);
        return scheinexam.toDTO();
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
    async delete(id: string): Promise<void> {
        const scheinexam = await this.findById(id);
        await this.em.removeAndFlush(scheinexam);
    }
}
