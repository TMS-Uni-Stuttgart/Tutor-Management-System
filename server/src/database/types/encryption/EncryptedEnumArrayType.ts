import { Dictionary } from '@mikro-orm/core';
import { EncryptedType } from './EncryptedType';

export class EncryptedEnumArrayType<T extends Dictionary> extends EncryptedType<T[]> {
    convertStringToValue(value: string): T[] {
        const parsed: unknown = JSON.parse(value);

        if (!Array.isArray(parsed)) {
            throw new Error('Value from the DB is not an array.');
        }

        return parsed;
    }

    convertValueToString(value: T[]): string {
        return JSON.stringify(value);
    }
}
