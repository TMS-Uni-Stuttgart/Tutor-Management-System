import { Module } from '@nestjs/common';
import { LocalesService } from './locales.service';
import { LocalesController } from './locales.controller';

@Module({
  providers: [LocalesService],
  controllers: [LocalesController]
})
export class LocalesModule {}
