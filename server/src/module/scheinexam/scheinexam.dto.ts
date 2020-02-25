import { IScheinExamDTO } from '../../shared/model/Scheinexam';
import { ExerciseDTO } from '../sheet/sheet.dto';
import { IsNumber, Min, Max, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IsLuxonDateTime } from '../../helpers/validators/luxon.validators';

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
  @ValidateNested({ each: true })
  @Type(() => ExerciseDTO)
  exercises!: ExerciseDTO[];
}
