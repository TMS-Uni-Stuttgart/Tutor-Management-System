import { CreateRequestContext, EntityRepository, MikroORM } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Inject, Injectable, Logger } from '@nestjs/common';
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
        private readonly repository: EntityRepository<SessionEntity>,
        @Inject(EntityManager)
        private readonly em: EntityManager
    ) {}

    @CreateRequestContext()
    async setSession(sid: string, sessionData: SessionData): Promise<void> {
        this.logger.log(`SET session for ID ${sid}`);
        const session = (await this.findSession(sid)) ?? new SessionEntity(sid, sessionData);
        session.sessionData = sessionData;

        await this.em.persistAndFlush(session);
    }

    @CreateRequestContext()
    async getSession(sid: string): Promise<SessionData | null> {
        this.logger.log(`GET session for ID ${sid}`);
        const session = await this.findSession(sid);
        return session?.sessionData ?? null;
    }

    @CreateRequestContext()
    async destroySession(sid: string): Promise<void> {
        this.logger.log(`DESTROY session with ID ${sid}`);
        const session = await this.findSession(sid);
        if (!!session) {
            await this.em.removeAndFlush(session);
        }
    }

    private findSession(sid: string): Promise<SessionEntity | null> {
        return this.repository.findOne({ sessionId: sid });
    }
}
