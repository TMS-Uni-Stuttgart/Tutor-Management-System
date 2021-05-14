import { EntityProperty, Platform, Type } from '@mikro-orm/core';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { StaticSettings } from '../../../module/settings/settings.static';

export abstract class EncryptedType<T> extends Type<T | undefined, string | undefined> {
    private readonly algorithm = 'aes-256-cbc';
    private readonly ivLength = 16;

    convertToDatabaseValue(
        value: T | undefined,
        platform: Platform,
        fromQuery?: boolean
    ): string | undefined {
        if (!value) {
            return undefined;
        }

        const stringRepresentation = this.convertValueToString(value);
        const buffer = Buffer.from(stringRepresentation, 'utf8');
        const iv = randomBytes(this.ivLength);

        const cipher = createCipheriv(this.algorithm, this.getDatabaseCryptoKey(), iv);
        const start = cipher.update(buffer);
        const end = cipher.final();

        return Buffer.concat([iv, start, end]).toString('base64');
    }

    convertToJSValue(value: string | undefined, platform: Platform): T | undefined {
        if (!value) {
            return undefined;
        }

        const buffer = Buffer.from(value, 'base64');
        const iv = buffer.slice(0, this.ivLength);

        const decipher = createDecipheriv(this.algorithm, this.getDatabaseCryptoKey(), iv);
        const start = decipher.update(buffer.slice(this.ivLength));
        const end = decipher.final();

        const decrypted = Buffer.concat([start, end]).toString('utf8');
        return this.convertStringToValue(decrypted);
    }

    getColumnType(prop: EntityProperty, platform: Platform): string {
        // TODO: Replace with platform call in v5
        return `varchar(${prop.length ?? 255})`;
    }

    /**
     * Converts the value to it's string representation.
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

    private getDatabaseCryptoKey(): Buffer {
        const secret = StaticSettings.getService().getDatabaseSecret();
        return this.convertKeyToHash(secret);
    }

    private convertKeyToHash(key: string): Buffer {
        return createHash('sha256').update(key).digest();
    }
}
