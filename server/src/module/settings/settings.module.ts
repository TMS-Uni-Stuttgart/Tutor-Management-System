import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Module({
  providers: [SettingsService],
})
export class SettingsModule {}
