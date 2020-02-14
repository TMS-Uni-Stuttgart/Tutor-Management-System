import { Module } from '@nestjs/common';
import { TutorialModule } from '../tutorial/tutorial.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TutorialModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
