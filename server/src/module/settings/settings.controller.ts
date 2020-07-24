import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../../guards/authenticated.guard';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('/')
  @UseGuards(AuthenticatedGuard)
  async getAllSettings(): Promise<ISettings> {
    return this.settingsService.getAllSettings();
  }
}
