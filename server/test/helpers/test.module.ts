import { Module } from '@nestjs/common';
import { SqlDatabaseModule } from '../../src/database/sql-database.module';
import {
    MOCKED_SCHEINCRITERIAS,
    MOCKED_SCHEINEXAMS,
    MOCKED_SETTINGS_DOCUMENT,
    MOCKED_SHEETS,
    MOCKED_SHORT_TESTS,
    MOCKED_STUDENTS,
    MOCKED_TEAMS,
    MOCKED_TUTORIALS,
    MOCKED_USERS,
} from '../mocks/entities.mock';

@Module({})
export class TestDatabaseModule extends SqlDatabaseModule {
    private readonly ENTITY_LISTS: any[][] = [
        MOCKED_TUTORIALS,
        MOCKED_USERS,
        MOCKED_STUDENTS,
        MOCKED_TEAMS,
        MOCKED_SHEETS,
        MOCKED_SCHEINEXAMS,
        MOCKED_SHORT_TESTS,
        MOCKED_SCHEINCRITERIAS,
        MOCKED_SETTINGS_DOCUMENT,
    ];

    async reset(): Promise<void> {
        const generator = this.orm.getSchemaGenerator();
        await generator.ensureDatabase();
        await generator.dropSchema();
        await generator.createSchema();

        await this.clearDatabase();
        await this.populateDatabase();
    }

    private async clearDatabase() {
        // TODO: Check if this clears entities added through tests from the EntityManager aswell.
        const em = this.orm.em.fork();
        await em.begin();

        for (const entities of this.ENTITY_LISTS) {
            em.remove(entities);
        }

        await em.commit();
    }

    private async populateDatabase() {
        const em = this.orm.em.fork(true, true);
        await em.begin();

        for (const entities of this.ENTITY_LISTS) {
            em.persist(entities);
        }

        await em.commit();
    }
}
