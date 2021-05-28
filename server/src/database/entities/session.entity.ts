import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { SessionData } from '../../helpers/mikro-orm-session-store/MikroOrmSessionStore';
import { EncryptedJsonType } from '../types/encryption/EncryptedJsonType';

@Entity({ tableName: 'session' })
export class SessionEntity {
    @PrimaryKey()
    readonly sessionId: string;

    @Property({ type: EncryptedJsonType })
    readonly sessionData: SessionData;

    constructor(sessionId: string, sessionData: SessionData) {
        this.sessionId = sessionId;
        this.sessionData = sessionData;
    }
}
