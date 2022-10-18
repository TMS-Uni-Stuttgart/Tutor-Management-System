import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Scheinexam } from '../../database/entities/scheinexam.entity';
import { ScheinexamController } from './scheinexam.controller';
import { ScheinexamService } from './scheinexam.service';

@Module({
    imports: [MikroOrmModule.forFeature([Scheinexam])],
    controllers: [ScheinexamController],
    providers: [ScheinexamService],
    exports: [ScheinexamService],
})
export class ScheinexamModule {}
