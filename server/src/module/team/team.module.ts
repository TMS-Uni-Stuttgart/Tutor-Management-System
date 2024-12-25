import { MikroOrmModule } from '@mikro-orm/nestjs';
import { forwardRef, Module } from '@nestjs/common';
import { Team } from '../../database/entities/team.entity';
import { StudentModule } from '../student/student.module';
import { TutorialModule } from '../tutorial/tutorial.module';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';

@Module({
    imports: [
        forwardRef(() => StudentModule),
        forwardRef(() => TutorialModule),
        MikroOrmModule.forFeature([Team]),
    ],
    providers: [TeamService],
    controllers: [TeamController],
    exports: [TeamService],
})
export class TeamModule {}
