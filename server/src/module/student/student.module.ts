import { forwardRef, Module } from '@nestjs/common';
import { ScheinexamModule } from '../scheinexam/scheinexam.module';
import { SheetModule } from '../sheet/sheet.module';
import { ShortTestModule } from '../short-test/short-test.module';
import { TeamModule } from '../team/team.module';
import { TutorialModule } from '../tutorial/tutorial.module';
import { GradingService } from './grading.service';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { GradingController } from './grading.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Grading } from 'database/entities/grading.entity';
import { Student } from 'database/entities/student.entity';

@Module({
    imports: [
        forwardRef(() => TeamModule),
        forwardRef(() => TutorialModule),
        SheetModule,
        ScheinexamModule,
        ShortTestModule,
        MikroOrmModule.forFeature([Grading, Student])
    ],
    controllers: [StudentController, GradingController],
    providers: [StudentService, GradingService],
    exports: [StudentService, GradingService],
})
export class StudentModule {}
