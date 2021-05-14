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
import { IUser } from 'shared/model/User';
import { v4 } from 'uuid';
import { EncryptedEnumArrayType } from '../types/encryption/EncryptedEnumArrayType';
import { EncryptedStringType } from '../types/encryption/EncryptedStringType';
import { Tutorial } from './tutorial.entity';

@Entity()
export class User {
    @PrimaryKey()
    id = v4();

    @Property({ type: EncryptedStringType })
    firstname: string;

    @Property({ type: EncryptedStringType })
    lastname: string;

    @Enum({ type: EncryptedEnumArrayType })
    roles: Role[];

    @Property({ type: EncryptedStringType })
    username: string;

    @Property({ type: EncryptedStringType })
    password: string;

    @Property({ type: EncryptedStringType })
    email: string;

    @Property({ type: EncryptedStringType })
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

    toDTO(): IUser {
        const tutorials = this.tutorials.getItems().map((tutorial) => tutorial.toInEntity());
        const tutorialsToCorrect = this.tutorialsToCorrect
            .getItems()
            .map((tutorial) => tutorial.toInEntity());

        return {
            id: this.id,
            username: this.username,
            firstname: this.firstname,
            lastname: this.lastname,
            roles: [...this.roles],
            email: this.email,
            temporaryPassword: this.temporaryPassword,
            tutorials,
            tutorialsToCorrect,
        };
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
