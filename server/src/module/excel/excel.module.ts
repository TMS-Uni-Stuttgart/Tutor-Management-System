import { Module } from '@nestjs/common';
import { ExcelService } from './excel.service';
import { ExcelController } from './excel.controller';
import { TutorialModule } from '../tutorial/tutorial.module';
import { SheetModule } from '../sheet/sheet.module';
import { StudentModule } from '../student/student.module';
import { ScheincriteriaModule } from '../scheincriteria/scheincriteria.module';

@Module({
    imports: [TutorialModule, SheetModule, StudentModule, ScheincriteriaModule],
    providers: [ExcelService],
    controllers: [ExcelController],
})
export class ExcelModule {}
