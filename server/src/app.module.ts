import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { StudentModule } from './module/student/student.module';
import { TutorialModule } from './module/tutorial/tutorial.module';
import { UserModule } from './module/user/user.module';
import { ModelsModule } from './database/models/models.module';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';
import { SheetModule } from './module/sheet/sheet.module';
import { ScheinexamModule } from './module/scheinexam/scheinexam.module';
import { ScheincriteriaModule } from './module/scheincriteria/scheincriteria.module';
import { TeamModule } from './module/team/team.module';
import { InformationModule } from './module/information/information.module';

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('/');
  }
}
