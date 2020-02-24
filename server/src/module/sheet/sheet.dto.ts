import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ISheetDTO, ISubexerciseDTO } from '../../shared/model/Sheet';

export class SubExerciseDTO implements ISubexerciseDTO {
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  exName!: string;

  // TODO: Or does one have to use "@IsNumber()" & "@Min(0)"?
  @IsPositive()
  maxPoints!: number;

  @IsNotEmpty()
  bonus!: boolean;
}

export class ExerciseDTO extends SubExerciseDTO {
  @IsArray()
  @IsOptional()
  @ValidateNested()
  subexercises?: SubExerciseDTO[];
}

export class SheetDTO implements ISheetDTO {
  @IsNotEmpty()
  sheetNo!: number;

  @IsNotEmpty()
  bonusSheet!: boolean;

  @IsArray()
  @ValidateNested()
  exercises!: ExerciseDTO[];
}
