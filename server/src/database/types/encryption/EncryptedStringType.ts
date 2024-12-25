import { EncryptedType } from './EncryptedType';

export class EncryptedStringType extends EncryptedType<string> {
    convertValueToString(value: string): string {
        return value;
    }

    convertStringToValue(value: string): string {
        return value;
    }
}
