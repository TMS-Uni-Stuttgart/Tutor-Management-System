import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { TutorialModule } from '../tutorial/tutorial.module';

@Module({
  imports: [TutorialModule],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}
