import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { StudentModule } from './module/student/student.module';
import { TutorialModule } from './module/tutorial/tutorial.module';
import { UserModule } from './module/user/user.module';
import { ModelsModule } from './database/models/models.module';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';

@Module({
  imports: [
    DatabaseModule.forRootAsync(),
    ModelsModule.init(),
    AuthModule,
    TutorialModule,
    UserModule,
    StudentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('/');
  }
}
