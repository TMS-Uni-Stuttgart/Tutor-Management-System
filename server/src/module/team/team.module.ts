import { forwardRef, Module } from '@nestjs/common';
import { StudentModule } from '../student/student.module';
import { TutorialModule } from '../tutorial/tutorial.module';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';

@Module({
    imports: [forwardRef(() => StudentModule), forwardRef(() => TutorialModule)],
    providers: [TeamService],
    controllers: [TeamController],
    exports: [TeamService],
})
export class TeamModule {}
