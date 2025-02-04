import { EntityRepository } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IShortTest } from 'shared/model/ShortTest';
import { ShortTest } from '../../database/entities/shorttest.entity';
import { CRUDService } from '../../helpers/CRUDService';
import { ShortTestDTO } from '../scheinexam/scheinexam.dto';

@Injectable()
export class ShortTestService implements CRUDService<IShortTest, ShortTestDTO, ShortTest> {
    constructor(
        @InjectRepository(ShortTest)
        private readonly repository: EntityRepository<ShortTest>,
        @Inject(EntityManager)
        private readonly em: EntityManager
    ) {}

    async findAll(): Promise<ShortTest[]> {
        return this.repository.findAll();
    }

    async findById(id: string): Promise<ShortTest> {
        const shortTest = await this.repository.findOne({ id });

        if (!shortTest) {
            throw new NotFoundException(
                `Short test document with the ID "${id}" could not be found.`
            );
        }

        return shortTest;
    }

    /**
     * Retrieves multiple `ShortTest` entities by their IDs.
     *
     * @param ids - Array of ShortTest IDs to retrieve.
     * @returns A list of `ShortTest` entities.
     * @throws `NotFoundException` - If any of the requested ShortTests are not found.
     */
    async findMany(ids: string[]): Promise<ShortTest[]> {
        const shortTests = await this.repository.find({ id: { $in: ids } });

        if (shortTests.length !== ids.length) {
            const foundIds = new Set(shortTests.map((st) => st.id));
            const missingIds = ids.filter((id) => !foundIds.has(id));
            throw new NotFoundException(
                `The following Short Test IDs could not be found: [${missingIds.join(', ')}]`
            );
        }

        return shortTests;
    }

    async create(dto: ShortTestDTO): Promise<IShortTest> {
        const shortTest = ShortTest.fromDTO(dto);
        await this.em.persistAndFlush(shortTest);
        return shortTest.toDTO();
    }

    async update(id: string, dto: ShortTestDTO): Promise<IShortTest> {
        const shortTest = await this.findById(id);
        shortTest.updateFromDTO(dto);
        await this.em.persistAndFlush(shortTest);
        return shortTest.toDTO();
    }

    async delete(id: string): Promise<void> {
        const shortTest = await this.findById(id);
        await this.em.removeAndFlush(shortTest);
    }
}
