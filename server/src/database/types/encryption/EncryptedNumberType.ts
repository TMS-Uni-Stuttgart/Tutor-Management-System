import { EncryptedType } from './EncryptedType';

interface EncryptedNumberOptions {
    readonly float?: boolean;
}

class EncryptedNumberType extends EncryptedType<number> {
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

export class EncryptedIntType extends EncryptedNumberType {
    constructor() {
        super({ float: false });
    }
}

export class EncryptedFloatType extends EncryptedNumberType {
    constructor() {
        super({ float: true });
    }
}
