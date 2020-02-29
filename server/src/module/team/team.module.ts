import { Module, forwardRef } from '@nestjs/common';
import { TeamService } from './team.service';
import { TutorialModule } from '../tutorial/tutorial.module';
import { StudentModule } from '../student/student.module';
import { TeamController } from './team.controller';

@Module({
  imports: [TutorialModule, forwardRef(() => StudentModule)],
  providers: [TeamService],
  controllers: [TeamController],
  exports: [TeamService],
})
export class TeamModule {}
