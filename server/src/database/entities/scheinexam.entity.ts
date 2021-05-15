import { Entity, Property } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { IScheinExam } from 'shared/model/Scheinexam';
import { ScheinexamDTO } from '../../module/scheinexam/scheinexam.dto';
import { LuxonDateTimeType } from '../types/LuxonDateTimeType';
import { Exercise, RatedEntity, RatedEntityParams } from './ratedEntity.entity';

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

    static fromDTO(dto: ScheinexamDTO): Scheinexam {
        return new Scheinexam({
            scheinExamNo: dto.scheinExamNo,
            date: DateTime.fromISO(dto.date),
            percentageNeeded: dto.percentageNeeded,
            exercises: dto.exercises.map((exDto) => Exercise.fromDTO(exDto)),
        });
    }

    toDTO(): IScheinExam {
        return {
            id: this.id,
            scheinExamNo: this.scheinExamNo,
            date: this.date.toISODate(),
            percentageNeeded: this.percentageNeeded,
            exercises: this.exercises.map((ex) => ex.toDTO()),
        };
    }
}

interface ScheinexamParams extends RatedEntityParams {
    scheinExamNo: number;
    date: DateTime;
}
