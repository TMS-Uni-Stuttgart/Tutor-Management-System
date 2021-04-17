import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Module } from '@nestjs/common';

@Module({
    imports: [
        MikroOrmModule.forRoot({
            entities: ['./dist/database/entities'], // TODO: Is this path the actual path in the build app?
            entitiesTs: ['./src/database/entities'],
            dbName: 'tms-poc-stuff', // TODO: Make adjustable
            type: 'postgresql',
            baseDir: process.cwd(),
            metadataProvider: TsMorphMetadataProvider,
            // clientUrl: '', // TODO: Add host, URL, ...?
        }),
    ],
})
export class SqlDatabaseModule {}
