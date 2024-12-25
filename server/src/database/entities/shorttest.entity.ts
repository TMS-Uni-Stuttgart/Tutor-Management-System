import { Entity, Property } from '@mikro-orm/core';
import { IShortTest } from 'shared/model/ShortTest';
import { ShortTestDTO } from '../../module/scheinexam/scheinexam.dto';
import { Exercise, RatedEntity, RatedEntityParams } from './ratedEntity.entity';

@Entity()
export class ShortTest extends RatedEntity {
    @Property()
    shortTestNo: number;

    constructor(params: ShortTestParams) {
        super(params);
        this.shortTestNo = params.shortTestNo;
    }

    toDTO(): IShortTest {
        return {
            id: this.id,
            shortTestNo: this.shortTestNo,
            percentageNeeded: this.percentageNeeded,
            exercises: this.exercises.map((ex) => ex.toDTO()),
        };
    }

    updateFromDTO(dto: ShortTestDTO): void {
        super.updateFromDTO(dto);
        this.shortTestNo = dto.shortTestNo;
    }

    static fromDTO(dto: ShortTestDTO): ShortTest {
        return new ShortTest({
            shortTestNo: dto.shortTestNo,
            percentageNeeded: dto.percentageNeeded,
            exercises: dto.exercises.map((exDto) => Exercise.fromDTO(exDto)),
        });
    }
}

interface ShortTestParams extends RatedEntityParams {
    shortTestNo: number;
}
