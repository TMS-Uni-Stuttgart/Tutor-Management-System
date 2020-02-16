import { Module, forwardRef } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { TutorialController } from './tutorial.controller';
import { TutorialService } from './tutorial.service';

@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [TutorialService],
  controllers: [TutorialController],
  exports: [TutorialService],
})
export class TutorialModule {}
