import { Module } from '@nestjs/common';
import { ShortTestService } from './short-test.service';

@Module({
  providers: [ShortTestService],
  exports: [ShortTestService],
})
export class ShortTestModule {}
