import { mongoose } from '@typegoose/typegoose';

/**
 * Generates a new mongoose ObjectId.
 *
 * @returns The generated ID
 */
export function generateObjectId(): string {
  return new mongoose.Types.ObjectId().toHexString();
}
