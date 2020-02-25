import { IsArray, IsOptional, IsString } from 'class-validator';
import { ITutorialDTO } from '../../shared/model/Tutorial';
import { IsLuxonDateTime } from '../../helpers/validators/luxon.validators';

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
