import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { DatabaseConfiguration } from './DatabaseConfiguration';
import { MailingConfiguration } from './MailingConfiguration';

class DefaultSettingsConfiguration {
  @IsNumber()
  @Min(1)
  @IsOptional()
  defaultTeamSize?: number;

  @IsBoolean()
  @IsOptional()
  canTutorExcuseStudents?: boolean;
}

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
  @Type(() => DefaultSettingsConfiguration)
  @ValidateNested()
  readonly defaultSettings: DefaultSettingsConfiguration | undefined;
}
