import { Entity, Property } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { LuxonDateTimeType } from '../types/LuxonDateTimeType';
import { RatedEntity } from './ratedEntity.entity';

@Entity()
export class Scheinexam extends RatedEntity {
    @Property()
    scheinExamNo!: number;

    @Property({ type: LuxonDateTimeType })
    date!: DateTime;
}
