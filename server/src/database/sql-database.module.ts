import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Module } from '@nestjs/common';

@Module({
    imports: [
        MikroOrmModule.forRoot({
            metadataProvider: TsMorphMetadataProvider,
            autoLoadEntities: true,
            baseDir: process.cwd(),
            entities: ['./dist/database/entities'], // TODO: Is this path the actual path in the build app?
            entitiesTs: ['./src/database/entities'],
            // TODO: Make overridable in tests (sqlite, because it supports in-memory stuff?)
            type: 'mysql',
            // TODO: Make everything below adjustable.
            host: '127.0.0.1',
            port: 3306,
            user: 'root',
            password: 'some-password',
            dbName: 'tms-poc-stuff',
            // clientUrl: 'postgresql://postgres:some-password@127.0.0.1:5432/tms-poc-stuff',
        }),
    ],
})
export class SqlDatabaseModule {}
