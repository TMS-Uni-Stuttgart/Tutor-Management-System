import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { TutorialModule } from './tutorial/tutorial.module';
import { UserModule } from './user/user.module';
import { StudentModule } from './student/student.module';

@Module({
  imports: [DatabaseModule.forRootAsync(), UserModule, AuthModule, TutorialModule, StudentModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
