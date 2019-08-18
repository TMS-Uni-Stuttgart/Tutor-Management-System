import { Ref } from 'typegoose';
import { ObjectID } from 'bson';

export function getIdOfDocumentRef<T extends { _id: ObjectID }>(doc: Ref<T>): string {
  if ('_id' in doc) {
    return doc._id.toString();
  }

  return doc.toString();
}

export function isDocument<T extends { _id: ObjectID }>(doc: Ref<T>): doc is T {
  return !(doc instanceof ObjectID);
}
