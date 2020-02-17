import { Provider } from '@nestjs/common';
import { getModelToken } from 'nestjs-typegoose';
import { TypegooseClass } from 'nestjs-typegoose/dist/typegoose-class.interface';
import { generateObjectId } from './test.helpers';

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
        find: (conditions?: any) => ({
          exec: () => {
            if (!conditions) {
              return [...alteredDocuments];
            }

            const docsToReturn: T[] = [];

            for (const doc of alteredDocuments) {
              if (this.checkConditions(doc, conditions)) {
                docsToReturn.push(doc);
              }
            }

            return docsToReturn;
          },
        }),
        findOne: (conditions: any) => ({
          exec: () => {
            for (const doc of alteredDocuments) {
              if (this.checkConditions(doc, conditions)) {
                return doc;
              }
            }

            return null;
          },
        }),
        findById: (id: string) => ({
          exec: () => {
            for (const doc of alteredDocuments) {
              if (this.checkConditions(doc, { _id: id })) {
                return doc;
              }
            }

            return null;
          },
        }),
        create: (doc: T) =>
          this.adjustDocument(doc, { id: generateObjectId(), ...additionalProperties }),
      },
    };
  }

  private static checkConditions<T>(doc: T, conditions: any): boolean {
    for (const [key, value] of Object.entries(conditions)) {
      if ((doc as any)[key] !== value) {
        return false;
      }
    }

    return true;
  }

  private static adjustDocument<T>(document: T, additionalProperties?: AdditionalProperties): T {
    const id = '_id' in document ? (document as any)._id : undefined;

    return Object.assign(document, {
      id,
      ...additionalProperties,
    });
  }
}
