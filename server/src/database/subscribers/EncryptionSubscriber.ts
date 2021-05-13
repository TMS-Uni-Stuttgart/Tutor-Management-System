import { EntityName, EventArgs, EventSubscriber } from '@mikro-orm/core';
import { User } from '../entities/user.entity';

export class EncryptionSubscriber implements EventSubscriber<IEncryptedEntity> {
    getSubscribedEntities(): EntityName<IEncryptedEntity>[] {
        return [User];
    }

    async beforeCreate(args: EventArgs<IEncryptedEntity>): Promise<void> {
        await this.encrypt(args);
    }

    async beforeUpdate(args: EventArgs<IEncryptedEntity>): Promise<void> {
        await this.encrypt(args);
    }

    onInit(args: EventArgs<IEncryptedEntity>): void {
        this.decrypt(args);
    }

    // TODO: How to handle different field types?
    private async encrypt(args: EventArgs<IEncryptedEntity>): Promise<void> {
        const entity = args.entity as any;
        const fieldsToEncrypt = entity.getEncryptedFieldNames();

        for (const field of fieldsToEncrypt) {
            if (field in entity) {
                entity[field] = 'ENCRYPTED';
            }
        }
    }

    private decrypt(args: EventArgs<IEncryptedEntity>): void {
        const entity = args.entity as any;
        const fieldToDecrypt = entity.getEncryptedFieldNames();

        for (const field of fieldToDecrypt) {
            if (field in entity) {
                entity[field] = 'DECRYPTED';
            }
        }
    }
}

export interface IEncryptedEntity {
    getEncryptedFieldNames(): string[];
}
