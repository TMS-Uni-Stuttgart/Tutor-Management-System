import { Module } from '@nestjs/common';
import { ExcelService } from './excel.service';
import { ExcelController } from './excel.controller';
import { TutorialModule } from '../tutorial/tutorial.module';
import { SheetModule } from '../sheet/sheet.module';
import { StudentModule } from '../student/student.module';

@Module({
    imports: [TutorialModule, SheetModule, StudentModule],
    providers: [ExcelService],
    controllers: [ExcelController],
})
export class ExcelModule {}
