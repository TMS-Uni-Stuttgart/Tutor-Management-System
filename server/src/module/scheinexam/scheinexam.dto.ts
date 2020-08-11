import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNumber, Max, Min, ValidateNested } from 'class-validator';
import { IsLuxonDateTime } from '../../helpers/validators/luxon.validator';
import { IRatedEntityDTO } from '../../shared/model/RatedEntity';
import { IScheinexamDTO } from '../../shared/model/Scheinexam';
import { IShortTestDTO } from '../../shared/model/ShortTest';
import { ExerciseDTO } from '../sheet/sheet.dto';

export class RatedEntityDTO implements IRatedEntityDTO {
  @IsNumber()
  @Min(0)
  @Max(1)
  percentageNeeded!: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ExerciseDTO)
  exercises!: ExerciseDTO[];
}

export class ShortTestDTO extends RatedEntityDTO implements IShortTestDTO {
  @IsNumber()
  shortTestNo!: string;
}

export class ScheinexamDTO extends RatedEntityDTO implements IScheinexamDTO {
  @IsNumber()
  scheinExamNo!: number;

  @IsLuxonDateTime()
  date!: string;
}
