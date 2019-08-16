import { Ref } from 'typegoose';

export function getIdOfDocumentRef<T extends { _id: string }>(doc: Ref<T>): string {
  if ('_id' in doc) {
    return doc._id;
  }

  return doc.toString();
}
