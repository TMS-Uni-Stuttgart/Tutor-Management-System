import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { TutorialModule } from './module/tutorial/tutorial.module';
import { UserModule } from './module/user/user.module';
import { StudentModule } from './module/student/student.module';

@Module({
  imports: [DatabaseModule.forRootAsync(), UserModule, AuthModule, TutorialModule, StudentModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
