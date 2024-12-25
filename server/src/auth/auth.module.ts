import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../module/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';

@Module({
    imports: [UserModule, PassportModule],
    providers: [AuthService, LocalStrategy, SessionSerializer],
    exports: [AuthService],
    controllers: [AuthController],
})
export class AuthModule {}
