import { Module } from '@nestjs/common';
import { TutorialService } from './tutorial.service';
import { TutorialController } from './tutorial.controller';
import { TypegooseModule } from 'nestjs-typegoose';
import { TutorialModel } from './tutorial.model';

@Module({
  imports: [TypegooseModule.forFeature([TutorialModel])],
  providers: [TutorialService],
  controllers: [TutorialController],
})
export class TutorialModule {}
