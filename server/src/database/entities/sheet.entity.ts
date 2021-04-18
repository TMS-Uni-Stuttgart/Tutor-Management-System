import { Entity, Property } from '@mikro-orm/core';
import { HasExercises, HasExercisesParams } from './ratedEntity.entity';

@Entity()
export class Sheet extends HasExercises {
    @Property()
    sheetNo: number;

    @Property()
    bonusSheet: boolean;

    constructor(params: SheetParams) {
        super(params);
        this.sheetNo = params.sheetNo;
        this.bonusSheet = params.bonusSheet;
    }
}

interface SheetParams extends HasExercisesParams {
    sheetNo: number;
    bonusSheet: boolean;
}
