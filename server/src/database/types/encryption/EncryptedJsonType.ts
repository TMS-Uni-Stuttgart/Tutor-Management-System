import { EntityProperty, Platform } from '@mikro-orm/core';
import { EncryptedType } from './EncryptedType';

export class EncryptedJsonType extends EncryptedType<Record<string, unknown>> {
    convertStringToValue(value: string): Record<string, unknown> {
        return JSON.parse(value);
    }

    convertValueToString(value: Record<string, unknown>): string {
        return JSON.stringify(value);
    }

    getColumnType(prop: EntityProperty, platform: Platform): string {
        // TODO: Can we use the platform with v5 here?
        return 'text';
    }
}
