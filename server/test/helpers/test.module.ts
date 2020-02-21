import { DynamicModule, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken, TypegooseModule } from 'nestjs-typegoose';
import { TypegooseClass } from 'nestjs-typegoose/dist/typegoose-class.interface';
import { UserModel } from '../../src/module/models/user.model';
import { USER_DOCUMENTS, TUTORIAL_DOCUMENTS, STUDENT_DOCUMENTS } from '../mocks/documents.mock';
import { TutorialModel } from '../../src/module/models/tutorial.model';
import { StudentModel } from '../../src/module/models/student.model';
import { TeamModel } from '../../src/module/models/team.model';

interface ModelMockOptions {
  model: TypegooseClass;
  initialDocuments: any[];
}

const MODEL_OPTIONS: ModelMockOptions[] = [
  {
    model: UserModel,
    initialDocuments: [...USER_DOCUMENTS],
  },
  { model: TutorialModel, initialDocuments: [...TUTORIAL_DOCUMENTS] },
  { model: StudentModel, initialDocuments: [...STUDENT_DOCUMENTS] },
  { model: TeamModel, initialDocuments: [] },
];

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
  static async forRootAsync(): Promise<DynamicModule> {
    const models = MODEL_OPTIONS.map(opt => opt.model);
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
      ],
      exports: [featureModule],
    };
  }

  constructor(
    private readonly mongodb: MongoMemoryServer,
    private readonly moduleRef: ModuleRef,
    @Inject(getConnectionToken()) private readonly connection: Connection
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
    for (const option of MODEL_OPTIONS) {
      const model = this.moduleRef.get<string, Model<any>>(getModelToken(option.model.name), {
        strict: false,
      });

      await model.insertMany(option.initialDocuments);
    }
  }
}
