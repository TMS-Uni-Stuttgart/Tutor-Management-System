import { Entity, Property } from '@mikro-orm/core';
import { HasExercises } from './ratedEntity.entity';

@Entity()
export class Sheet extends HasExercises {
    @Property()
    sheetNo!: number;

    @Property()
    bonusSheet!: number;
}
