import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { ClientSettingsDTO } from '../settings.dto';
import { DatabaseConfiguration } from './DatabaseConfiguration';
import { MailingConfiguration } from './MailingConfiguration';

export class ApplicationConfiguration {
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly sessionTimeout?: number;

  @IsOptional()
  @IsString()
  readonly prefix: string | undefined;

  @Type(() => DatabaseConfiguration)
  @ValidateNested()
  readonly database!: DatabaseConfiguration;

  @Type(() => MailingConfiguration)
  @ValidateNested()
  readonly mailing!: MailingConfiguration;

  @IsOptional()
  @Type(() => ClientSettingsDTO)
  @ValidateNested()
  readonly defaultSettings: ClientSettingsDTO | undefined;
}
