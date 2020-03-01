import { Module } from '@nestjs/common';
import { InformationService } from './information.service';
import { InformationController } from './information.controller';

@Module({
  providers: [InformationService],
  controllers: [InformationController],
})
export class InformationModule {}
