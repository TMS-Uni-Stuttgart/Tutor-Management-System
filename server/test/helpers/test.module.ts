import { DynamicModule, Module, OnApplicationShutdown } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { TypegooseModule } from 'nestjs-typegoose';
import { TypegooseClass } from 'nestjs-typegoose/dist/typegoose-class.interface';

@Module({})
export class TestModule implements OnApplicationShutdown {
  private static mongodb: MongoMemoryServer | undefined;

  /**
   * Generates a module which contains a connection to the in-memory mongo database aswell as the corresponding providers for the given models.
   *
   * __Important__: If this module is used in a testing module you have to call `close()` in the correspoding `afterAll` or `afterEach` test function. If you forget to do this the connection will prevent Jest from exiting.
   *
   * @param models Models to register in the module
   * @return Promise which resolves to the generated DynamicModule.
   */
  static async forRootAsync(models: TypegooseClass[]): Promise<DynamicModule> {
    this.mongodb = new MongoMemoryServer({
      instance: {
        dbName: 'tms',
      },
      debug: false,
    });
    const connectionUri = await this.mongodb.getConnectionString();
    const featureModule = TypegooseModule.forFeature(models);

    return {
      module: TestModule,
      imports: [
        TypegooseModule.forRoot(connectionUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }),
        featureModule,
      ],
      exports: [featureModule],
    };
  }

  async onApplicationShutdown() {
    if (TestModule.mongodb) {
      await TestModule.mongodb.stop();
    }
  }
}
