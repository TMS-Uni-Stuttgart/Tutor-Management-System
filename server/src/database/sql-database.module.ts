import { MikroORM } from '@mikro-orm/core';
import { ISchemaGenerator } from '@mikro-orm/core/typings';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Logger, Module, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { StartUpException } from '../exceptions/StartUpException';
import { wait } from '../helpers/wait';
import { StaticSettings } from '../module/settings/settings.static';

@Module({
    imports: [
        MikroOrmModule.forRoot({
            metadataProvider: TsMorphMetadataProvider,
            baseDir: process.cwd(),
            entities: ['./dist/database/entities'], // TODO: Is this path the actual path in the build app?
            entitiesTs: ['./src/database/entities'],
            type: 'mysql',
            debug: false,
            ...StaticSettings.getService().getDatabaseConnectionInformation(),
        }),
    ],
})
export class SqlDatabaseModule implements OnModuleInit, OnApplicationShutdown {
    private readonly logger = new Logger(SqlDatabaseModule.name);
    private readonly databaseConfig = StaticSettings.getService().getDatabaseConfiguration();

    constructor(private readonly orm: MikroORM) {}

    async onModuleInit(): Promise<void> {
        const generator = this.orm.getSchemaGenerator();

        await this.ensureDatabaseConnection(generator);
        await this.updateSchema(generator);
    }

    async onApplicationShutdown(): Promise<void> {
        if (await this.orm.isConnected()) {
            await this.orm.close();
        }
    }

    private async ensureDatabaseConnection(generator: ISchemaGenerator): Promise<void> {
        let currentTry = 1;

        while (!(await this.orm.isConnected())) {
            await this.tryToConnectToDatabase(generator, currentTry);
            currentTry++;
        }

        this.logger.log('Connection to SQL database established.');
    }

    private async tryToConnectToDatabase(
        generator: ISchemaGenerator,
        currentTry: number
    ): Promise<void> {
        this.logger.log(`Establishing connection to the database (try: ${currentTry})...`);
        const maxRetries = this.databaseConfig.maxRetries ?? 2;
        const reconnectTimeout = this.databaseConfig.reconnectTimeout ?? 10000;

        try {
            await generator.ensureDatabase();
        } catch (err) {
            if (currentTry >= maxRetries) {
                throw new StartUpException(
                    `Connection to SQL database failed after ${currentTry} tries.`
                );
            } else {
                this.logger.warn(
                    `Could not connect to the SQL database (try: ${currentTry}). Waiting ${reconnectTimeout}ms before the next try...`
                );
                await wait(reconnectTimeout);
            }
        }
    }

    private async updateSchema(generator: ISchemaGenerator): Promise<void> {
        const updateDump = await generator.getUpdateSchemaSQL(true, true);

        // TODO: Is there a better indicator when we should update the schema?
        //       Or make a DB dump and use it as a backup.
        if (updateDump.includes('create table') || updateDump.includes('alter table')) {
            this.logger.log('Updating SQL schema...');
            await generator.updateSchema(true, true);
            this.logger.log('SQL schema successfully updated.');
        } else {
            this.logger.log('SQL schema is up-to-date. No update required.');
        }
    }
}
