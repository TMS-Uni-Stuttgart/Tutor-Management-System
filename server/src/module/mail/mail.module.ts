import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [MailService],
  controllers: [MailController],
})
export class MailModule {}
