import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { StudentModel } from './models/student.model';
import { TeamModel } from './models/team.model';
import { AttendanceModel } from './models/attendance.model';

@Module({
  imports: [TypegooseModule.forFeature([StudentModel, TeamModel, AttendanceModel])],
})
export class StudentModule {}
