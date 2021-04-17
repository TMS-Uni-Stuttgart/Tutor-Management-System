import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity()
export class Team {
    @PrimaryKey()
    id = v4();

    @Property()
    teamNo!: number;
}
