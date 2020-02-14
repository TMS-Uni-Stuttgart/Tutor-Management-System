import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { AttendanceModel } from './attendance.model';
import { GradingModel } from './points.model';
import { StudentModel } from './student.model';
import { TeamModel } from './team.model';
import { TutorialModel } from './tutorial.model';
import { UserModel } from './user.model';

@Module({
  imports: [
    TypegooseModule.forFeature([
      AttendanceModel,
      GradingModel,
      StudentModel,
      TeamModel,
      TutorialModel,
      UserModel,
    ]),
  ],
})
export class ModelsModule {}
