import { Body, Controller, Get, Put, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthenticatedGuard } from '../../guards/authenticated.guard';
import { HasRoleGuard } from '../../guards/has-role.guard';
import { IClientSettings } from '../../shared/model/Settings';
import { ClientSettingsDTO } from './settings.dto';
import { SettingsService } from './settings.service';

@Controller('setting')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) {}

    @Get('/')
    @UseGuards(AuthenticatedGuard)
    async getAllSettings(): Promise<IClientSettings> {
        return this.settingsService.getClientSettings();
    }

    @Put('/')
    @UseGuards(HasRoleGuard)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async setSettings(@Body() settings: ClientSettingsDTO): Promise<void> {
        await this.settingsService.setClientSettings(settings);
    }
}
