import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ModelsModule } from './module/models/models.module';
import { StudentModule } from './module/student/student.module';
import { TutorialModule } from './module/tutorial/tutorial.module';
import { UserModule } from './module/user/user.module';

@Module({
  imports: [
    DatabaseModule.forRootAsync(),
    ModelsModule,
    UserModule,
    AuthModule,
    TutorialModule,
    StudentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
