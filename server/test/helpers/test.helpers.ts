import { mongoose } from '@typegoose/typegoose';

/**
 * Removes unneccessary elements & type information from the object.
 *
 * The given object is first stringified into JSON and then re-parsed to a POJO. This removes type information like a mongoose array being used instead of a JS array.
 *
 * However, this means only 'enumbarable' properties will stay in the adjusted object (ie class functions will be removed aswell).
 *
 * @param obj Object to sanitize.
 *
 * @returns The adjusted object.
 */
export function sanitizeObject<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)) as T;
}

/**
 * Generates a new mongoose ObjectId.
 *
 * @returns The generated ID
 */
export function generateObjectId(): string {
    return new mongoose.Types.ObjectId().toHexString();
}
