import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../module/user/user.module';
import { AuthService } from './auth.service';
import { LocalStratey } from './local.strategy';
import { SessionSerializer } from './session.serializer';
import { AuthController } from './auth.controller';

@Module({
    imports: [UserModule, PassportModule],
    providers: [AuthService, LocalStratey, SessionSerializer],
    exports: [AuthService],
    controllers: [AuthController],
})
export class AuthModule {}
