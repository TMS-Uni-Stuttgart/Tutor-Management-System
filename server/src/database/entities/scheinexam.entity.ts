import { Entity, Property } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { LuxonDateTimeType } from '../types/LuxonDateTimeType';
import { RatedEntity, RatedEntityParams } from './ratedEntity.entity';

@Entity()
export class Scheinexam extends RatedEntity {
    @Property()
    scheinExamNo: number;

    @Property({ type: LuxonDateTimeType })
    date: DateTime;

    constructor(params: ScheinexamParams) {
        super(params);
        this.scheinExamNo = params.scheinExamNo;
        this.date = params.date;
    }
}

interface ScheinexamParams extends RatedEntityParams {
    scheinExamNo: number;
    date: DateTime;
}
