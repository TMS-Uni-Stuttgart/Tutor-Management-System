declare namespace Express {
    interface User {
        id: string;
        username: string;
        roles: import('../src/shared/model/Role').Role[];
    }
}
