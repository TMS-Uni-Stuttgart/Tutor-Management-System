import { EntityRepository } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { Injectable, NotFoundException } from '@nestjs/common';
import { IShortTest } from 'shared/model/ShortTest';
import { ShortTest } from '../../database/entities/shorttest.entity';
import { CRUDService } from '../../helpers/CRUDService';
import { ShortTestDTO } from '../scheinexam/scheinexam.dto';

@Injectable()
export class ShortTestService implements CRUDService<IShortTest, ShortTestDTO, ShortTest> {
    constructor(private readonly entityManager: EntityManager) {}

    async findAll(): Promise<ShortTest[]> {
        return this.getShortTestRepository().findAll();
    }

    async findById(id: string): Promise<ShortTest> {
        const shortTest = await this.getShortTestRepository().findOne({ id });

        if (!shortTest) {
            throw new NotFoundException(
                `Short test document with the ID "${id}" could not be found.`
            );
        }

        return shortTest;
    }

    async create(dto: ShortTestDTO): Promise<IShortTest> {
        const shortTest = ShortTest.fromDTO(dto);
        await this.entityManager.persistAndFlush(shortTest);
        return shortTest.toDTO();
    }

    async update(id: string, dto: ShortTestDTO): Promise<IShortTest> {
        const shortTest = await this.findById(id);
        shortTest.updateFromDTO(dto);
        await this.entityManager.persistAndFlush(shortTest);
        return shortTest.toDTO();
    }

    async delete(id: string): Promise<void> {
        const shortTest = await this.findById(id);
        await this.entityManager.removeAndFlush(shortTest);
    }

    private getShortTestRepository(): EntityRepository<ShortTest> {
        return this.entityManager.getRepository(ShortTest);
    }
}
