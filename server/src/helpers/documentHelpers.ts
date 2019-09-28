import { Ref } from '@hasezoey/typegoose';
import { ObjectID } from 'bson';

export function getIdOfDocumentRef<T extends { _id: ObjectID }>(doc: Ref<T>): string {
  if ('_id' in doc) {
    return doc._id.toString();
  }

  return doc.toString();
}
