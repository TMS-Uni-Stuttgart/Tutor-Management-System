import { Entity, Enum, PrimaryKey, Property } from '@mikro-orm/core';
import { Role } from 'shared/model/Role';
import { v4 } from 'uuid';

@Entity()
export class User {
    @PrimaryKey()
    id = v4();

    @Property()
    firstname!: string;

    @Property()
    lastname!: string;

    @Enum({ items: () => Role })
    roles!: Role[];

    @Property()
    username!: string;

    @Property()
    password!: string;

    @Property()
    email!: string;

    @Property()
    temporaryPassword?: string;
}
