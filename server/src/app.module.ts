import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SqlDatabaseModule } from './database/sql-database.module';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';
import { ExcelModule } from './module/excel/excel.module';
import { InformationModule } from './module/information/information.module';
import { LocalesModule } from './module/locales/locales.module';
import { MailModule } from './module/mail/mail.module';
import { MarkdownModule } from './module/markdown/markdown.module';
import { PdfModule } from './module/pdf/pdf.module';
import { ScheincriteriaModule } from './module/scheincriteria/scheincriteria.module';
import { ScheinexamModule } from './module/scheinexam/scheinexam.module';
import { SessionModule } from './module/session/session.module';
import { SettingsModule } from './module/settings/settings.module';
import { SheetModule } from './module/sheet/sheet.module';
import { ShortTestModule } from './module/short-test/short-test.module';
import { StudentModule } from './module/student/student.module';
import { TeamModule } from './module/team/team.module';
import { TutorialModule } from './module/tutorial/tutorial.module';
import { UserModule } from './module/user/user.module';

@Module({
    imports: [
        SqlDatabaseModule,
        AuthModule,
        SessionModule,
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
        LocalesModule,
        ShortTestModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(RequestLoggerMiddleware).forRoutes('/');
    }
}
