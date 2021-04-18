import { Entity, Property } from '@mikro-orm/core';
import { RatedEntity } from './ratedEntity.entity';

@Entity()
export class ShortTest extends RatedEntity {
    @Property()
    shortTestNo!: number;
}
