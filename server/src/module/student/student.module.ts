import { Module, forwardRef } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { TutorialModule } from '../tutorial/tutorial.module';
import { TeamModule } from '../team/team.module';
import { SheetModule } from '../sheet/sheet.module';

@Module({
  imports: [TutorialModule, SheetModule, forwardRef(() => TeamModule)],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
