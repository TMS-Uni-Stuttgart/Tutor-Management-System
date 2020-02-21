import { DynamicModule, Module, OnApplicationShutdown, Inject } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { TypegooseModule, getConnectionToken } from 'nestjs-typegoose';
import { TypegooseClass } from 'nestjs-typegoose/dist/typegoose-class.interface';

@Module({})
export class TestModule implements OnApplicationShutdown {
  private mongodb: MongoMemoryServer | undefined;
  private connection: Connection | undefined;

  /**
   * Generates a module which contains a connection to the in-memory mongo database aswell as the corresponding providers for the given models.
   *
   * __Important__: If this module is used in a testing module you have to call `close()` in the correspoding `afterAll` or `afterEach` test function. If you forget to do this the connection will prevent Jest from exiting.
   *
   * @param models Models to register in the module
   * @return Promise which resolves to the generated DynamicModule.
   */
  static async forRootAsync(models: TypegooseClass[]): Promise<DynamicModule> {
    const testModule = new TestModule();

    return testModule.init(models);
  }

  constructor(mongodb?: MongoMemoryServer, @Inject(getConnectionToken()) connection?: Connection) {
    this.mongodb = mongodb;
    this.connection = connection;
  }

  async init(models: TypegooseClass[]): Promise<DynamicModule> {
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
      providers: [
        {
          provide: MongoMemoryServer,
          useValue: this.mongodb,
        },
      ],
      exports: [featureModule],
    };
  }

  async reset() {
    if (!this.connection) {
      return;
    }

    console.log(this.connection?.modelNames());

    await Promise.all(
      Object.values(this.connection.collections).map(collection => collection.deleteMany({}))
    );
  }

  async onApplicationShutdown() {
    if (this.mongodb) {
      await this.mongodb.stop();
    }
  }
}
