import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { MailingConfiguration } from './model/MailingConfiguration';

export class ClientSettingsDTO {
    @IsNumber()
    @Min(1)
    defaultTeamSize!: number;

    @IsBoolean()
    canTutorExcuseStudents!: boolean;

    @IsString()
    @IsOptional()
    gradingFilename?: string;

    @IsString()
    @IsOptional()
    tutorialGradingFilename?: string;

    @IsOptional()
    @Type(() => MailingConfiguration)
    @ValidateNested()
    mailingConfig?: MailingConfiguration;
}
