import { IsArray, IsOptional, IsString, IsMongoId } from 'class-validator';
import { ITutorialDTO, ISubstituteDTO } from '../../shared/model/Tutorial';
import { IsLuxonDateTime } from '../../helpers/validators/luxon.validator';

export class TutorialDTO implements ITutorialDTO {
  @IsString()
  slot!: string;

  @IsOptional()
  @IsString()
  tutorId?: string;

  @IsLuxonDateTime()
  startTime!: string;

  @IsLuxonDateTime()
  endTime!: string;

  @IsArray()
  @IsLuxonDateTime({ each: true })
  dates!: string[];

  @IsArray()
  @IsString({ each: true })
  correctorIds!: string[];
}

export class SubstituteDTO implements ISubstituteDTO {
  @IsOptional()
  @IsMongoId()
  tutorId?: string;

  @IsArray()
  @IsLuxonDateTime({ each: true })
  dates!: string[];
}
