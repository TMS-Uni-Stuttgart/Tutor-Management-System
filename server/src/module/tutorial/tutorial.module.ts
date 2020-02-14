import { Module } from '@nestjs/common';
import { TutorialController } from './tutorial.controller';
import { TutorialService } from './tutorial.service';

@Module({
  providers: [TutorialService],
  controllers: [TutorialController],
})
export class TutorialModule {}
