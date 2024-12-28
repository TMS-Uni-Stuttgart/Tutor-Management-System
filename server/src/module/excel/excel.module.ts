import { Module } from '@nestjs/common';
import { ScheincriteriaModule } from '../scheincriteria/scheincriteria.module';
import { SheetModule } from '../sheet/sheet.module';
import { StudentModule } from '../student/student.module';
import { TutorialModule } from '../tutorial/tutorial.module';
import { UserModule } from '../user/user.module';
import { ExcelController } from './excel.controller';
import { ExcelService } from './excel.service';

@Module({
    imports: [TutorialModule, SheetModule, StudentModule, ScheincriteriaModule, UserModule],
    providers: [ExcelService],
    controllers: [ExcelController],
})
export class ExcelModule {}
