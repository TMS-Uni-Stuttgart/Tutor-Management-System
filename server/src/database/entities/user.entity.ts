import {
    Collection,
    Entity,
    Enum,
    ManyToMany,
    OneToMany,
    PrimaryKey,
    Property,
} from '@mikro-orm/core';
import { Role } from 'shared/model/Role';
import { v4 } from 'uuid';
import { Tutorial } from './tutorial.entity';

@Entity()
export class User {
    @PrimaryKey()
    id = v4();

    @Property()
    firstname: string;

    @Property()
    lastname: string;

    @Enum({ items: () => Role })
    roles: Role[];

    @Property()
    username: string;

    @Property()
    password: string;

    @Property()
    email: string;

    @Property()
    temporaryPassword?: string;

    @OneToMany(() => Tutorial, (tutorial) => tutorial.tutor)
    tutorials = new Collection<Tutorial>(this);

    @ManyToMany(() => Tutorial, 'correctors', { owner: true })
    tutorialsToCorrect = new Collection<Tutorial>(this);

    constructor({ firstname, lastname, roles, username, password, email }: UserParams) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.roles = roles;
        this.username = username;
        this.password = password;
        this.email = email;
    }
}

interface UserParams {
    firstname: string;
    lastname: string;
    roles: Role[];
    username: string;
    password: string;
    email: string;
}
