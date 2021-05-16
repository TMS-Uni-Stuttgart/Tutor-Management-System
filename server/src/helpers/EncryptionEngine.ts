import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { StaticSettings } from '../module/settings/settings.static';

// FIXME: Re-enable actual encryption!
export class EncryptionEngine {
    private readonly algorithm = 'aes-256-cbc';
    private readonly ivLength = 16;
    private readonly secret: Buffer;

    constructor() {
        this.secret = createHash('sha256').update(this.getKey()).digest();
    }

    encrypt(clearText: string): string {
        return clearText;
        const buffer = Buffer.from(clearText, 'utf8');
        const iv = randomBytes(this.ivLength);

        const cipher = createCipheriv(this.algorithm, this.secret, iv);
        const start = cipher.update(buffer);
        const end = cipher.final();

        return Buffer.concat([iv, start, end]).toString('base64');
    }

    decrypt(encrypted: string): string {
        return encrypted;
        const buffer = Buffer.from(encrypted, 'base64');
        const iv = buffer.slice(0, this.ivLength);

        const decipher = createDecipheriv(this.algorithm, this.secret, iv);
        const start = decipher.update(buffer.slice(this.ivLength));
        const end = decipher.final();

        return Buffer.concat([start, end]).toString('utf8');
    }

    private getKey(): string {
        return StaticSettings.getService().getDatabaseSecret();
    }
}
