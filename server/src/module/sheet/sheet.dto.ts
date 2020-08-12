import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ISubexerciseDTO } from '../../shared/model/HasExercises';
import { ISheetDTO } from '../../shared/model/Sheet';

export class SubExerciseDTO implements ISubexerciseDTO {
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsString()
  exName!: string;

  @IsNumber()
  @Min(0)
  maxPoints!: number;

  @IsBoolean()
  bonus!: boolean;
}

export class ExerciseDTO extends SubExerciseDTO {
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SubExerciseDTO)
  subexercises?: SubExerciseDTO[];
}

export class SheetDTO implements ISheetDTO {
  @IsNumber()
  sheetNo!: number;

  @IsBoolean()
  bonusSheet!: boolean;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ExerciseDTO)
  exercises!: ExerciseDTO[];
}
