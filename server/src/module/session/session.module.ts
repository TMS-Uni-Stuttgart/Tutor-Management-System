import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { SessionEntity } from 'database/entities/session.entity';
import { SessionService } from './session.service';

@Module({
    imports: [MikroOrmModule.forFeature([SessionEntity])],
    providers: [SessionService],
    exports: [SessionService],
})
export class SessionModule {}
