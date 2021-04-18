import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity()
export class Scheincriteria {
    @PrimaryKey()
    id = v4();

    @Property()
    name!: string;

    // TODO: How to handle this one?
    @Property()
    criteria!: Scheincriteria;
}
