import { EntityRepository, MikroORM, UseRequestContext } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, Logger } from '@nestjs/common';
import { SessionEntity } from '../../database/entities/session.entity';
import {
    ISessionService,
    SessionData,
} from '../../helpers/mikro-orm-session-store/MikroOrmSessionStore';

@Injectable()
export class SessionService implements ISessionService {
    private readonly logger = new Logger(SessionService.name);

    constructor(
        private readonly orm: MikroORM,
        @InjectRepository(SessionEntity)
        private readonly repository: EntityRepository<SessionEntity>
    ) { }

    @UseRequestContext()
    async setSession(sid: string, sessionData: SessionData): Promise<void> {
        this.logger.log(`SET session for ID ${sid}`);
        const session = (await this.findSession(sid)) ?? new SessionEntity(sid, sessionData);
        session.sessionData = sessionData;

        await this.repository.persistAndFlush(session);
    }

    @UseRequestContext()
    async getSession(sid: string): Promise<SessionData | null> {
        this.logger.log(`GET session for ID ${sid}`);
        const session = await this.findSession(sid);
        return session?.sessionData ?? null;
    }

    @UseRequestContext()
    async destroySession(sid: string): Promise<void> {
        this.logger.log(`DESTROY session with ID ${sid}`);
        const session = await this.findSession(sid);
        if (!!session) {
            await this.repository.removeAndFlush(session);
        }
    }

    private findSession(sid: string): Promise<SessionEntity | null> {
        return this.repository.findOne({ sessionId: sid });
    }
}
