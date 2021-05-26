import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { SessionData } from '../../helpers/mikro-orm-session-store/MikroOrmSessionStore';

@Entity({ tableName: 'session' })
export class SessionEntity {
    @PrimaryKey()
    readonly sessionId: string;

    // TODO: Encrypt property!
    @Property({ type: 'json' })
    readonly sessionData: SessionData;

    constructor(sessionId: string, sessionData: SessionData) {
        this.sessionId = sessionId;
        this.sessionData = sessionData;
    }
}
