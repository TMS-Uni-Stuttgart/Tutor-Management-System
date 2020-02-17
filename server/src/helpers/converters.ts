import { DocumentType } from '@typegoose/typegoose';

/**
 * Converts a Map with documents as values to it's array representation.
 *
 * The array representation contains the key and the ID of every document saved in the given map. This representation can be used to send the information as JSON and to instantiate a new Map from it.
 *
 * @param map Map to convert.
 *
 * @returns Array representation of the map containing the document IDs..
 */
export function convertDocumentMapToArray(
  map: Map<string, DocumentType<{ id?: string }>>
): [string, string][] {
  const converted = new Map<string, string>();

  for (const [key, doc] of map.entries()) {
    converted.set(key, doc.id);
  }

  return [...converted];
}
