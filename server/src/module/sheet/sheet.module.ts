import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Sheet } from 'database/entities/sheet.entity';
import { SheetController } from './sheet.controller';
import { SheetService } from './sheet.service';

@Module({
    imports: [MikroOrmModule.forFeature([Sheet])],
    controllers: [SheetController],
    providers: [SheetService],
    exports: [SheetService],
})
export class SheetModule {}
