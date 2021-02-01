import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { IChangeSettingsDTO } from '../../shared/model/Settings';
import { MailingConfiguration } from './model/MailingConfiguration';

export class ClientSettingsDTO implements IChangeSettingsDTO {
    @IsNumber()
    @Min(1)
    defaultTeamSize!: number;

    @IsBoolean()
    canTutorExcuseStudents!: boolean;

    @IsString()
    gradingFilename!: string;

    @IsString()
    tutorialGradingFilename!: string;

    @IsOptional()
    @Type(() => MailingConfiguration)
    @ValidateNested()
    mailingConfig?: MailingConfiguration;
}
