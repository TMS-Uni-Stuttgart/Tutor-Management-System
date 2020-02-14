import { DynamicModule, Global, Logger, Module, Provider } from '@nestjs/common';
import mongoose, { Connection } from 'mongoose';
import { getConnectionToken } from 'nestjs-typegoose';
import { TYPEGOOSE_CONNECTION_NAME } from 'nestjs-typegoose/dist/typegoose.constants';
import { databaseConfig } from '../helpers/config';
import { ModelsModule } from '../module/models/models.module';

@Global()
@Module({})
export class DatabaseModule {
  private static readonly CONNECTION_NAME = 'tms-db-connection';

  static async forRootAsync(): Promise<DynamicModule> {
    const connection = await this.connectToDB();

    const connectionName = getConnectionToken();
    const connectionNameProvider: Provider = {
      provide: TYPEGOOSE_CONNECTION_NAME,
      useValue: connectionName,
    };

    const connectionProvider: Provider = {
      provide: connectionName,
      useFactory: () => connection,
    };

    return {
      module: DatabaseModule,
      providers: [connectionProvider, connectionNameProvider],
      exports: [connectionProvider],
    };
  }

  private static connectToDB(): Promise<Connection> {
    return new Promise((resolve, reject) => {
      const maxRetries = databaseConfig.maxRetries ?? 2;

      async function tryToConnect(prevTries: number) {
        if (prevTries >= maxRetries) {
          return reject(
            new Error(`Connection to MongoDB database failed after ${prevTries} tries.`)
          );
        }

        try {
          Logger.log(
            `Connecting to MongoDB database (previous tries: ${prevTries})...`,
            DatabaseModule.name
          );

          const connection = await mongoose.createConnection(databaseConfig.databaseURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            ...databaseConfig.config,
          });

          Logger.log('Connection to MongoDB database established.', DatabaseModule.name);

          return resolve(connection);
        } catch {
          tryToConnect(++prevTries);
        }
      }

      tryToConnect(0);
    });
  }
}
