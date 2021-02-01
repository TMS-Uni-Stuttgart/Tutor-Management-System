import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { HasRoleGuard } from '../../guards/has-role.guard';
import { MailingStatus } from '../../shared/model/Mail';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
    constructor(private readonly mailService: MailService) {}

    @Get('/credentials')
    @UseGuards(HasRoleGuard)
    async sendCredentials(): Promise<MailingStatus> {
        const status = await this.mailService.mailCredentials();

        return status;
    }

    @Get('/credentials/:id')
    @UseGuards(HasRoleGuard)
    async sendCredentialsForSingleUser(@Param('id') userId: string): Promise<MailingStatus> {
        const status = await this.mailService.mailSingleCredentials(userId);

        return status;
    }
}
