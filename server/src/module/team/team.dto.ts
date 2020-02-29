import { ITeamDTO } from '../../shared/model/Team';
import { IsArray, IsString } from 'class-validator';

export class TeamDTO implements ITeamDTO {
  @IsArray()
  @IsString({ each: true })
  students!: string[];
}
