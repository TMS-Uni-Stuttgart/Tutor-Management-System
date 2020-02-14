import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { StudentModel } from './models/student.model';
import { TeamModel } from './models/team.model';
import { AttendanceModel } from './models/attendance.model';
import { GradingModel } from './models/points.model';

@Module({
  imports: [TypegooseModule.forFeature([StudentModel, TeamModel, AttendanceModel, GradingModel])],
})
export class StudentModule {}
