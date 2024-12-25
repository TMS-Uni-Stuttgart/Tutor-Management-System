import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, Min, ValidateNested } from 'class-validator';
import { MailingConfiguration } from './model/MailingConfiguration';

export class ClientSettingsDTO {
    @IsNumber()
    @Min(1)
    defaultTeamSize!: number;

    @IsBoolean()
    canTutorExcuseStudents!: boolean;

    @IsOptional()
    gradingFilename?: string;

    @IsOptional()
    tutorialGradingFilename?: string;

    @IsOptional()
    @Type(() => MailingConfiguration)
    @ValidateNested()
    mailingConfig?: MailingConfiguration;
}
