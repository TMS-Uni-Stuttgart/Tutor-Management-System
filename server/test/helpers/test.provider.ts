import { Provider } from '@nestjs/common';
import { getModelToken } from 'nestjs-typegoose';
import { TypegooseClass } from 'nestjs-typegoose/dist/typegoose-class.interface';
import { generateObjectId } from './test.helpers';

type AdditionalProperties = { [key: string]: any };

type MockedDocument<T> = T & {
  id: string;
  save: () => MockedDocument<T>;
  remove: () => MockedDocument<T>;
};

interface ProviderOptions<T> {
  modelClass: TypegooseClass;
  documents: T[];
  additionalDocProperties?: AdditionalProperties;
}

class MockedQuery<T> {
  constructor(private readonly elementToReturn: MockedDocument<T> | MockedDocument<T>[] | null) {}

  exec() {
    return this.elementToReturn;
  }
}

export class MongooseMockModelProvider<T> {
  static create<T>({
    modelClass,
    documents,
    additionalDocProperties: additionalProperties,
  }: ProviderOptions<T>): Provider {
    return {
      provide: getModelToken(modelClass.name),
      useValue: new MongooseMockModelProvider(documents, additionalProperties),
    };
  }

  private readonly documents: MockedDocument<T>[];

  constructor(documents: T[], private readonly additionalProperties?: AdditionalProperties) {
    this.documents = documents.map(doc => this.adjustDocument(doc, additionalProperties));
  }

  find(conditions?: any): MockedQuery<T> {
    if (!conditions) {
      return new MockedQuery([...this.documents]);
    }

    const docsToReturn: MockedDocument<T>[] = [];

    for (const doc of this.documents) {
      if (this.checkConditions(doc, conditions)) {
        docsToReturn.push(doc);
      }
    }

    return new MockedQuery(docsToReturn);
  }

  findOne(conditions: any): MockedQuery<T | null> {
    for (const doc of this.documents) {
      if (this.checkConditions(doc, conditions)) {
        return new MockedQuery(doc);
      }
    }

    return new MockedQuery(null);
  }

  findById(id: string): MockedQuery<T | null> {
    return this.findOne({ id: id });
  }

  create(doc: MockedDocument<T>): MockedDocument<T> {
    const adjustedDoc = this.adjustDocument(doc, {
      id: generateObjectId(),
      ...this.additionalProperties,
    });

    this.documents.push(adjustedDoc);

    return adjustedDoc;
  }

  save(docToSave: MockedDocument<T>): MockedDocument<T> {
    const index = this.documents.findIndex(doc => doc.id === docToSave.id);

    if (index === -1) {
      return this.create(docToSave);
    }

    this.documents[index] = docToSave;
    return this.documents[index];
  }

  remove(docToRemove: MockedDocument<T>): MockedDocument<T> | null {
    const index = this.documents.findIndex(doc => doc.id === docToRemove.id);

    if (index === -1) {
      throw new Error('Document to remove could not be found');
    }

    const doc = this.documents[index];
    this.documents.splice(index, 1);

    return doc;
  }

  private adjustDocument<T>(
    document: T,
    additionalProperties?: AdditionalProperties
  ): MockedDocument<T> {
    const id = '_id' in document ? (document as any)._id : undefined;
    const adjustedDocument: any = Object.assign(document, { id, ...additionalProperties });

    return Object.assign(document, {
      id,
      save: this.save.bind(this, adjustedDocument) as any,
      remove: this.remove.bind(this, adjustedDocument) as any,
      ...additionalProperties,
    });
  }

  private checkConditions<T>(doc: T, conditions: any): boolean {
    for (const [key, value] of Object.entries(conditions)) {
      if ((doc as any)[key] !== value) {
        return false;
      }
    }

    return true;
  }
}
