import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNumber, Max, Min, ValidateNested } from 'class-validator';
import { IsLuxonDateTime } from '../../helpers/validators/luxon.validator';
import { IScheinExamDTO } from '../../shared/model/Scheinexam';
import { ExerciseDTO } from '../sheet/sheet.dto';

export class ScheinExamDTO implements IScheinExamDTO {
  @IsNumber()
  scheinExamNo!: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  percentageNeeded!: number;

  @IsLuxonDateTime()
  date!: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ExerciseDTO)
  exercises!: ExerciseDTO[];
}
