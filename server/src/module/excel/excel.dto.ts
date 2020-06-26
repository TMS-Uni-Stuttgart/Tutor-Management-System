import { IsString, IsOptional } from 'class-validator';
import { ParseConfig } from 'papaparse';
import { IParseCsvDTO } from '../../shared/model/CSV';

export class ParseCsvDTO implements IParseCsvDTO {
  @IsString()
  data!: string;

  @IsOptional()
  options?: ParseConfig<unknown>;
}
