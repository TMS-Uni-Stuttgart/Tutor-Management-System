import { EntityManager, MikroORM } from '@mikro-orm/core';
import { Module } from '@nestjs/common';
import { AttendanceCriteria } from '../../src/module/scheincriteria/container/criterias/AttendanceCriteria';
import { PresentationCriteria } from '../../src/module/scheincriteria/container/criterias/PresentationCriteria';
import { ScheinexamCriteria } from '../../src/module/scheincriteria/container/criterias/ScheinexamCriteria';
import { SheetIndividualCriteria } from '../../src/module/scheincriteria/container/criterias/SheetIndividualCriteria';
import { SheetTotalCriteria } from '../../src/module/scheincriteria/container/criterias/SheetTotalCriteria';
import { ShortTestCriteria } from '../../src/module/scheincriteria/container/criterias/ShortTestCriteria';
import { ScheincriteriaContainer } from '../../src/module/scheincriteria/container/scheincriteria.container';
import { ScheincriteriaConstructor } from '../../src/module/scheincriteria/scheincriteria.module';
import { ENTITY_LISTS, populateMockLists } from '../mocks/entities.mock';

@Module({})
export class TestDatabaseModule {
    constructor(private readonly orm: MikroORM) {
        this.initCriteriaContainer();
    }

    async init(): Promise<void> {
        const generator = this.orm.getSchemaGenerator();
        await generator.ensureDatabase();
        await generator.dropSchema();
        await generator.createSchema();

        await this.generateMocks(this.orm.em.fork());
        await this.populateDatabase();
    }

    async reset(): Promise<void> {
        // TODO: How to reset the DB between tests?
    }

    private async populateDatabase() {
        const em = this.orm.em.fork();

        for (const entities of ENTITY_LISTS) {
            em.persist(entities);
        }

        await em.flush();
    }

    private initCriteriaContainer() {
        const container = ScheincriteriaContainer.getContainer();
        const criterias: ScheincriteriaConstructor[] = [
            AttendanceCriteria,
            PresentationCriteria,
            SheetIndividualCriteria,
            SheetTotalCriteria,
            ScheinexamCriteria,
            ShortTestCriteria,
        ];

        criterias.forEach((criteria) => container.registerBluePrint(criteria));
    }

    private async generateMocks(em: EntityManager) {
        await populateMockLists(em);
    }
}
