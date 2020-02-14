import { Provider } from '@nestjs/common';
import { buildSchema } from '@typegoose/typegoose';
import mockingoose from 'mockingoose';
import mongoose from 'mongoose';
import { TypegooseClass } from 'nestjs-typegoose/dist/typegoose-class.interface';

type Mock = ReturnType<typeof mockingoose>;

interface ProviderOptions {
  modelClass: TypegooseClass;
  provide: string;
  factory: (mock: Mock) => void;
}

export class MongooseModelProvider {
  /**
   * Generates a provider for a test which mocks the mongoose model of the given class.
   *
   * This function takes in three options:
   * - `modelClass`: The class which model should be mocked.
   * - `provide`: The value of the `provide` field in the returned provider.
   * - `factory`: A function that takes in the generated _mocked_ model. Should be used to define the values returned by the mocked model by calling `toReturn` (example: https://github.com/alonronin/mockingoose#mockingoosemodeltoreturnobj-operation--find)
   *
   * @param options Options to create the provider. More information see above.
   * @returns The generated provider which provides the mocked model.
   */
  static create({ modelClass, provide, factory }: ProviderOptions): Provider {
    const model = this.getModelOrGenerate(modelClass.name, modelClass);
    const mock = mockingoose(model);

    factory(mock);

    return {
      provide,
      useValue: model,
    };
  }

  private static getModelOrGenerate(
    name: string,
    modelClass: TypegooseClass
  ): mongoose.Model<mongoose.Document> {
    const model = mongoose.models[name];

    if (!!model) {
      return model;
    } else {
      return mongoose.model(modelClass.name, buildSchema(modelClass));
    }
  }
}
