import {
    BeforeCreate,
    BeforeUpdate,
    Collection,
    Entity,
    Enum,
    EventArgs,
    ManyToMany,
    OneToMany,
    PrimaryKey,
    Property,
} from '@mikro-orm/core';
import bcrypt from 'bcryptjs';
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

    /**
     * Makes sure that the password is saved in a hashed form.
     *
     * If the password got changed since the last load of this entity it will get rehashed. Else the password field is not changed.
     *
     * Runs on create & update events. You should not call it directly.
     *
     * @param args {@link EventArgs} Arguments of the event triggering this function.
     */
    @BeforeCreate()
    @BeforeUpdate()
    private hashPassword(args: EventArgs<User>): void {
        const isSamePassword = this.password === args.changeSet?.originalEntity?.password;
        if (!isSamePassword) {
            const salt = bcrypt.genSaltSync(10);
            this.password = bcrypt.hashSync(this.password, salt);
        }
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
