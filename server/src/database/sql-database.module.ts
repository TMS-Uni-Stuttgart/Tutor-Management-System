import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

@Module({
    imports: [
        MikroOrmModule.forRoot({
            entities: ['./dist/database/entities'],
            entitiesTs: ['./src/database/entities'],
            dbName: 'tms-poc-stuff', // TODO: Make adjustable
            type: 'postgresql',
            baseDir: process.cwd(),
            // clientUrl: '', // TODO: Add host, URL, ...?
        }),
    ],
})
export class SqlDatabaseModule {}
