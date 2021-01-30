import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNumber, Max, Min, ValidateNested } from 'class-validator';
import { IsLuxonDateTime } from '../../helpers/validators/luxon.validator';
import { IHasExercisesDTO } from '../../shared/model/HasExercises';
import { IRatedEntityDTO } from '../../shared/model/RatedEntity';
import { IScheinexamDTO } from '../../shared/model/Scheinexam';
import { IShortTestDTO } from '../../shared/model/ShortTest';
import { ExerciseDTO } from '../sheet/sheet.dto';

export class HasExercisesDTO implements IHasExercisesDTO {
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => ExerciseDTO)
    exercises!: ExerciseDTO[];
}

export class RatedEntityDTO extends HasExercisesDTO implements IRatedEntityDTO {
    @IsNumber()
    @Min(0)
    @Max(1)
    percentageNeeded!: number;
}

export class ShortTestDTO extends RatedEntityDTO implements IShortTestDTO {
    @IsNumber()
    shortTestNo!: number;
}

export class ScheinexamDTO extends RatedEntityDTO implements IScheinexamDTO {
    @IsNumber()
    scheinExamNo!: number;

    @IsLuxonDateTime()
    date!: string;
}
