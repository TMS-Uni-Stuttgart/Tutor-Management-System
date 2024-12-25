import { EncryptedType } from './EncryptedType';

export class EncryptedEnumType<T> extends EncryptedType<T> {
    convertStringToValue(value: string): T {
        return value as any;
    }

    convertValueToString(value: T): string {
        return value + '';
    }
}
