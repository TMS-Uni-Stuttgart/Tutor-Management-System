import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { InformationController } from './information.controller';
import { InformationService } from './information.service';

@Module({
  providers: [InformationService],
  controllers: [InformationController],
  imports: [SettingsModule],
})
export class InformationModule {}
