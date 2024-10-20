import { EntityProperty, Platform, Type } from '@mikro-orm/core';
import { TransformContext } from '@mikro-orm/mysql';
import { EncryptionEngine } from '../../../helpers/EncryptionEngine';

export abstract class EncryptedType<T> extends Type<T | undefined, string | undefined> {
    convertToDatabaseValue(
        value: T | undefined,
        platform: Platform,
        context: TransformContext | undefined
    ): string | undefined {
        if (value == undefined) {
            return undefined;
        }

        const stringRepresentation = this.convertValueToString(value);
        return new EncryptionEngine().encrypt(stringRepresentation);
    }

    convertToJSValue(value: string | undefined, platform: Platform): T | undefined {
        if (value == undefined) {
            return undefined;
        }

        const decrypted = new EncryptionEngine().decrypt(value);
        return this.convertStringToValue(decrypted);
    }

    getColumnType(prop: EntityProperty, platform: Platform): string {
        // TODO: Replace with platform call in v5
        return `varchar(${prop.length ?? 255})`;
    }

    /**
     * Converts the value to its string representation.
     *
     * This is called before the value is encrypted.
     *
     * @param value Value to encrypt.
     * @returns String representation of the value.
     */
    abstract convertValueToString(value: T): string;

    /**
     * Converts the string representation to the actual value.
     *
     * This is called after the value is decrypted.
     *
     * @param value String representation of the value.
     * @returns The actual value (with it's proper type).
     */
    abstract convertStringToValue(value: string): T;
}
