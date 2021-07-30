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
    async reset(): Promise<void> {
        console.log('Calling reset!!');

        const generator = this.orm.getSchemaGenerator();
        await generator.ensureDatabase();
        await generator.dropSchema();
        await generator.createSchema();

        const em = this.orm.em;
        em.persist(MOCKED_TUTORIALS);
        em.persist(MOCKED_USERS);
        em.persist(MOCKED_STUDENTS);
        em.persist(MOCKED_TEAMS);
        em.persist(MOCKED_SHEETS);
        em.persist(MOCKED_SCHEINEXAMS);
        em.persist(MOCKED_SHORT_TESTS);
        em.persist(MOCKED_SCHEINCRITERIAS);
        em.persist(MOCKED_SETTINGS_DOCUMENT);

        await em.flush();
    }
}
