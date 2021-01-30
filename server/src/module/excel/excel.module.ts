import { Module } from '@nestjs/common';
import { ExcelService } from './excel.service';
import { ExcelController } from './excel.controller';
import { TutorialModule } from '../tutorial/tutorial.module';
import { SheetModule } from '../sheet/sheet.module';

@Module({
    imports: [TutorialModule, SheetModule],
    providers: [ExcelService],
    controllers: [ExcelController],
})
export class ExcelModule {}
