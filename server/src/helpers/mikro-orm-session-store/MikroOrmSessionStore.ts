import session from 'express-session';

export class MikroOrmSessionStore extends session.Store {
    constructor(private readonly service: ISessionService) {
        super();
    }

    get(sid: string, callback: (err: any, session: SessionData | null) => void): void {
        this.service
            .getSession(sid)
            .then((sessionData) => callback(null, sessionData))
            .catch((err) => callback(err, null));
    }

    set(sid: string, session: SessionData, callback?: (err?: any) => void): void {
        this.service
            .setSession(sid, session)
            .then(() => callback?.(null))
            .catch((err) => callback?.(err));
    }

    destroy(sid: string, callback?: (err?: any) => void): void {
        this.service
            .destroySession(sid)
            .then(() => callback?.(undefined))
            .catch((err) => callback?.(err));
    }
}

export interface ISessionService {
    /**
     * @param sid ID of the session
     * @returns Data associated with the session ID. If no session was found `null` is returned.
     */
    getSession(sid: string): Promise<SessionData | null>;

    /**
     * Sets the data of the given session.
     *
     * @param sid ID of the session
     * @param session Data of the session.
     */
    setSession(sid: string, session: SessionData): Promise<void>;

    /**
     * Destroys the session with the given ID.
     *
     * @param sid ID of the session.
     */
    destroySession(sid: string): Promise<void>;
}

export type SessionData = session.SessionData;
