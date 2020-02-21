import { DynamicModule, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken, TypegooseModule } from 'nestjs-typegoose';
import { TypegooseClass } from 'nestjs-typegoose/dist/typegoose-class.interface';

const MODEL_OPTIONS = 'MODEL_OPTIONS';

interface ModelMockOptions {
  model: TypegooseClass;
  initialDocuments: any[];
}

@Module({})
export class TestModule implements OnApplicationShutdown {
  /**
   * Generates a module which contains a connection to the in-memory mongo database aswell as the corresponding providers for the given models.
   *
   * __Important__: If this module is used in a testing module you have to call `close()` in the correspoding `afterAll` or `afterEach` test function. If you forget to do this the connection will prevent Jest from exiting.
   *
   * @param models Models to register in the module
   * @return Promise which resolves to the generated DynamicModule.
   */
  static async forRootAsync(options: ModelMockOptions[]): Promise<DynamicModule> {
    const models = options.map(opt => opt.model);
    const mongodb = new MongoMemoryServer({
      instance: {
        dbName: 'tms',
      },
      debug: false,
    });
    const connectionUri = await mongodb.getConnectionString();
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
          useValue: mongodb,
        },
        {
          provide: MODEL_OPTIONS,
          useValue: options,
        },
      ],
      exports: [featureModule],
    };
  }

  constructor(
    private readonly mongodb: MongoMemoryServer,
    private readonly moduleRef: ModuleRef,
    @Inject(getConnectionToken()) private readonly connection: Connection,
    @Inject(MODEL_OPTIONS) private readonly options: ModelMockOptions[]
  ) {}

  async reset() {
    if (!this.connection) {
      return;
    }

    await Promise.all(
      Object.values(this.connection.collections).map(collection => collection.deleteMany({}))
    );

    await this.fillCollections();
  }

  async onApplicationShutdown() {
    if (this.mongodb) {
      await this.mongodb.stop();
    }
  }

  private async fillCollections() {
    for (const option of this.options) {
      const model = this.moduleRef.get<string, Model<any>>(getModelToken(option.model.name), {
        strict: false,
      });

      await model.insertMany(option.initialDocuments);
    }
  }
}
