import { Module } from '@nestjs/common';
import { ShortTestService } from './short-test.service';
import { ShortTestController } from './short-test.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ShortTest } from 'database/entities/shorttest.entity';

@Module({
    imports: [MikroOrmModule.forFeature([ShortTest])],
    providers: [ShortTestService],
    exports: [ShortTestService],
    controllers: [ShortTestController],
})
export class ShortTestModule {}
