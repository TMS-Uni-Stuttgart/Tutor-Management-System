import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, Min, ValidateNested } from 'class-validator';
import { IChangeSettingsDTO } from '../../shared/model/Settings';
import { MailingConfiguration } from './model/MailingConfiguration';

export class ClientSettingsDTO implements IChangeSettingsDTO {
  @IsNumber()
  @Min(1)
  @IsOptional()
  defaultTeamSize?: number;

  @IsBoolean()
  @IsOptional()
  canTutorExcuseStudents?: boolean;

  @IsOptional()
  @Type(() => MailingConfiguration)
  @ValidateNested()
  mailingConfig?: MailingConfiguration;
}
