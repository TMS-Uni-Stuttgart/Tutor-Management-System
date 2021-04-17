import { EntityProperty, Platform, Type, ValidationError } from '@mikro-orm/core';

export class MapType extends Type<Map<unknown, unknown>, string> {
    convertToDatabaseValue(value: Map<unknown, unknown> | string | undefined, _: Platform): string {
        if (!value || typeof value === 'string') {
            return value ?? '';
        }

        if (value instanceof Map) {
            return JSON.stringify([...value]);
        }

        throw ValidationError.invalidType(MapType, value, 'JS');
    }

    convertToJSValue(
        value: Map<unknown, unknown> | string | undefined,
        _: Platform
    ): Map<unknown, unknown> {
        if (value instanceof Map) {
            return value;
        }

        if (!value) {
            return new Map();
        }

        try {
            const mapContent = JSON.parse(value);
            return new Map(mapContent);
        } catch (err) {
            throw ValidationError.invalidType(MapType, value, 'database');
        }
    }

    getColumnType(_prop: EntityProperty, _platform: Platform): string {
        return 'longtext';
    }
}
