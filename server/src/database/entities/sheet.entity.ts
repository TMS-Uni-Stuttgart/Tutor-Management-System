import { Entity, Property } from '@mikro-orm/core';
import { ISheet } from 'shared/model/Sheet';
import { SheetDTO } from '../../module/sheet/sheet.dto';
import { Exercise, HasExercises, HasExercisesParams } from './ratedEntity.entity';

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

    /**
     * @returns The number of the sheet formatted as a string which has at least 2 digits (with leading zeros if necessary).
     */
    get sheetNoAsString(): string {
        return this.sheetNo.toString(10).padStart(2, '0');
    }

    static fromDTO(dto: SheetDTO): Sheet {
        return new Sheet({
            sheetNo: dto.sheetNo,
            bonusSheet: dto.bonusSheet,
            exercises: dto.exercises.map((exDto) => Exercise.fromDTO(exDto)),
        });
    }

    updateFromDTO(dto: SheetDTO): void {
        super.updateFromDTO(dto);
        this.sheetNo = dto.sheetNo;
        this.bonusSheet = dto.bonusSheet;
    }

    toDTO(): ISheet {
        return {
            id: this.id,
            sheetNo: this.sheetNo,
            bonusSheet: this.bonusSheet,
            exercises: this.exercises.map((ex) => ex.toDTO()),
        };
    }
}

interface SheetParams extends HasExercisesParams {
    sheetNo: number;
    bonusSheet: boolean;
}
