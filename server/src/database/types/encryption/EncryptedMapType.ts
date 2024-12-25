import { ValidationError } from '@mikro-orm/core';
import { EncryptedType } from './EncryptedType';

export class EncryptedMapType extends EncryptedType<Map<unknown, unknown>> {
    convertStringToValue(value: string): Map<unknown, unknown> {
        if (!value) {
            return new Map();
        }

        try {
            const mapContent = JSON.parse(value);
            return new Map(mapContent);
        } catch (err) {
            throw ValidationError.invalidType(EncryptedMapType, value, 'database');
        }
    }

    convertValueToString(value: Map<unknown, unknown>): string {
        return JSON.stringify([...value]);
    }
}
