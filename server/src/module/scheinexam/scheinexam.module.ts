import { Module } from '@nestjs/common';
import { ScheinexamController } from './scheinexam.controller';
import { ScheinexamService } from './scheinexam.service';

@Module({
  controllers: [ScheinexamController],
  providers: [ScheinexamService],
  exports: [ScheinexamService],
})
export class ScheinexamModule {}
