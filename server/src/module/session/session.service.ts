import { EntityManager } from '@mikro-orm/mysql';
import { Injectable, Logger } from '@nestjs/common';
import { SessionEntity } from '../../database/entities/session.entity';
import {
    ISessionService,
    SessionData,
} from '../../helpers/mikro-orm-session-store/MikroOrmSessionStore';

@Injectable()
export class SessionService implements ISessionService {
    private readonly logger = new Logger(SessionService.name);

    constructor(private readonly entityManager: EntityManager) {}

    async getSession(sid: string): Promise<SessionData | null> {
        this.logger.log(`GET session for ID ${sid}...`);
        const session = await this.entityManager.findOne(SessionEntity, { sessionId: sid });
        return session?.sessionData ?? null;
    }

    async setSession(sid: string, sessionData: SessionData): Promise<void> {
        this.logger.log(`SET session for ID ${sid} with data:`);
        const session = new SessionEntity(sid, sessionData);
        await this.entityManager.persistAndFlush(session);
    }

    async destroySession(sid: string): Promise<void> {
        this.logger.log(`DESTROY session with ID ${sid}`);
        const session = await this.getSession(sid);
        if (!!session) {
            await this.entityManager.removeAndFlush(session);
        }
    }
}
