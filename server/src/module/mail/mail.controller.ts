import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { HasRoleGuard } from '../../guards/has-role.guard';
import { Role } from '../../shared/model/Role';
import { MailingStatus } from '../../shared/model/Mail';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('/credentials')
  @UseGuards(new HasRoleGuard(Role.ADMIN))
  async sendCredentials(): Promise<MailingStatus> {
    const status = await this.mailService.mailCredentials();

    return status;
  }

  @Get('/credentials/:id')
  @UseGuards(new HasRoleGuard(Role.ADMIN))
  async sendCredentialsForSingleUser(@Param('id') userId: string): Promise<MailingStatus> {
    const status = await this.mailService.mailSingleCredentials(userId);

    return status;
  }
}
