import { Module } from '@nestjs/common';
import { ShortTestService } from './short-test.service';
import { ShortTestController } from './short-test.controller';

@Module({
  providers: [ShortTestService],
  exports: [ShortTestService],
  controllers: [ShortTestController],
})
export class ShortTestModule {}
