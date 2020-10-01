import { forwardRef, Module } from '@nestjs/common';
import { ScheinexamModule } from '../scheinexam/scheinexam.module';
import { SheetModule } from '../sheet/sheet.module';
import { ShortTestModule } from '../short-test/short-test.module';
import { TeamModule } from '../team/team.module';
import { TutorialModule } from '../tutorial/tutorial.module';
import { GradingService } from './grading.service';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';

@Module({
  imports: [
    forwardRef(() => TeamModule),
    forwardRef(() => TutorialModule),
    SheetModule,
    ScheinexamModule,
    ShortTestModule,
  ],
  controllers: [StudentController],
  providers: [StudentService, GradingService],
  exports: [StudentService, GradingService],
})
export class StudentModule {}
