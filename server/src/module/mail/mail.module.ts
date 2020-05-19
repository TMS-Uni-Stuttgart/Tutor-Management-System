import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { UserModule } from '../user/user.module';
import { TemplateModule } from '../template/template.module';

@Module({
  imports: [UserModule, TemplateModule],
  providers: [MailService],
  controllers: [MailController],
})
export class MailModule {}
