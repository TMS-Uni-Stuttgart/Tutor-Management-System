declare namespace Express {
    interface User {
        _id: string;
        username: string;
        roles: import('../src/shared/model/Role').Role[];
    }
}
