import { forwardRef, Module } from '@nestjs/common';
import { ScheinexamModule } from '../scheinexam/scheinexam.module';
import { SheetModule } from '../sheet/sheet.module';
import { ShortTestModule } from '../short-test/short-test.module';
import { TeamModule } from '../team/team.module';
import { TutorialModule } from '../tutorial/tutorial.module';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';

@Module({
  imports: [
    TutorialModule,
    SheetModule,
    ScheinexamModule,
    ShortTestModule,
    forwardRef(() => TeamModule),
  ],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
