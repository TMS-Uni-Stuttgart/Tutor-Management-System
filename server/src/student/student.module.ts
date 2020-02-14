import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { StudentModel } from './student.model';

@Module({
  imports: [TypegooseModule.forFeature([StudentModel])],
})
export class StudentModule {}
