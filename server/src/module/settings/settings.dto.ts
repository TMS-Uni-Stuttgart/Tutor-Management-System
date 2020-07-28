import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';
import { IClientSettings } from '../../shared/model/Settings';

export class ClientSettingsDTO implements Partial<IClientSettings> {
  @IsNumber()
  @Min(1)
  @IsOptional()
  defaultTeamSize?: number;

  @IsBoolean()
  @IsOptional()
  canTutorExcuseStudents?: boolean;
}
