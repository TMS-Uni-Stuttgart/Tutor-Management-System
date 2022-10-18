import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';
import { Setting } from 'database/entities/settings.entity';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Global()
@Module({
    imports: [MikroOrmModule.forFeature([Setting])],
    providers: [SettingsService],
    exports: [SettingsService],
    controllers: [SettingsController],
})
export class SettingsModule {}
