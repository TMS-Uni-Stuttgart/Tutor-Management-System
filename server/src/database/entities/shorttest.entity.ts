import { Entity, Property } from '@mikro-orm/core';
import { RatedEntity, RatedEntityParams } from './ratedEntity.entity';

@Entity()
export class ShortTest extends RatedEntity {
    @Property()
    shortTestNo: number;

    constructor(params: ShortTestParams) {
        super(params);
        this.shortTestNo = params.shortTestNo;
    }
}

interface ShortTestParams extends RatedEntityParams {
    shortTestNo: number;
}
