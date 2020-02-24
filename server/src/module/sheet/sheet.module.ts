import { Module } from '@nestjs/common';
import { SheetController } from './sheet.controller';
import { SheetService } from './sheet.service';

@Module({
  controllers: [SheetController],
  providers: [SheetService],
})
export class SheetModule {}
