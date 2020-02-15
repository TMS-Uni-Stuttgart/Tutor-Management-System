import { Provider } from '@nestjs/common';
import mockingoose from 'mockingoose';
import { getModelToken } from 'nestjs-typegoose';
import { TypegooseClass } from 'nestjs-typegoose/dist/typegoose-class.interface';

export type Mock = ReturnType<typeof mockingoose>;

type AdditionalProperties = { [key: string]: any };

interface ProviderOptions<T> {
  modelClass: TypegooseClass;
  documents: T[];
  additionalDocProperties?: AdditionalProperties;
}

export class MongooseMockModelProvider {
  static create<T>({
    modelClass,
    documents,
    additionalDocProperties: additionalProperties,
  }: ProviderOptions<T>): Provider {
    const alteredDocuments = documents.map(doc => this.adjustDocument(doc, additionalProperties));

    return {
      provide: getModelToken(modelClass.name),
      useValue: {
        find: () => ({
          exec: () => [...alteredDocuments],
        }),
        findOne: (conditions: any) => ({
          exec: () => {
            for (const doc of alteredDocuments) {
              let found = true;
              for (const [key, value] of Object.entries(conditions)) {
                if ((doc as any)[key] !== value) {
                  found = false;
                  break;
                }
              }

              if (found) {
                return doc;
              }
            }

            return null;
          },
        }),
        create: (doc: T) => this.adjustDocument(doc, additionalProperties),
      },
    };
  }

  private static adjustDocument<T>(document: T, additionalProperties?: AdditionalProperties): T {
    const id = '_id' in document ? (document as any)._id : undefined;

    return Object.assign(document, {
      id,
      ...additionalProperties,
    });
  }
}
