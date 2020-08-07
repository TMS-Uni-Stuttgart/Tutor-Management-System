import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ModelsModule } from './database/models/models.module';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';
import { ExcelModule } from './module/excel/excel.module';
import { InformationModule } from './module/information/information.module';
import { MailModule } from './module/mail/mail.module';
import { MarkdownModule } from './module/markdown/markdown.module';
import { PdfModule } from './module/pdf/pdf.module';
import { ScheincriteriaModule } from './module/scheincriteria/scheincriteria.module';
import { ScheinexamModule } from './module/scheinexam/scheinexam.module';
import { SettingsModule } from './module/settings/settings.module';
import { SheetModule } from './module/sheet/sheet.module';
import { StudentModule } from './module/student/student.module';
import { TeamModule } from './module/team/team.module';
import { TutorialModule } from './module/tutorial/tutorial.module';
import { UserModule } from './module/user/user.module';

@Module({
  imports: [
    DatabaseModule.forRootAsync(),
    ModelsModule.init(),
    AuthModule,
    TutorialModule,
    UserModule,
    StudentModule,
    SheetModule,
    ScheinexamModule,
    ScheincriteriaModule,
    TeamModule,
    InformationModule,
    PdfModule,
    MarkdownModule,
    MailModule,
    ExcelModule,
    SettingsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggerMiddleware).forRoutes('/');
  }
}
