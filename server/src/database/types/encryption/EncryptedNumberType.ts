import { EncryptedType } from './EncryptedType';

interface EncryptedNumberOptions {
    readonly float?: boolean;
}

export class EncryptedNumberType extends EncryptedType<number> {
    constructor(private readonly options: EncryptedNumberOptions = {}) {
        super();
    }

    convertStringToValue(value: string): number {
        return this.options.float ? Number.parseFloat(value) : Number.parseInt(value, 10);
    }

    convertValueToString(value: number): string {
        return value.toString(10);
    }
}
