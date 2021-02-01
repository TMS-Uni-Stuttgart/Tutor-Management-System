import { forwardRef, Module } from '@nestjs/common';
import { StudentModule } from '../student/student.module';
import { UserModule } from '../user/user.module';
import { TutorialController } from './tutorial.controller';
import { TutorialService } from './tutorial.service';

@Module({
    imports: [forwardRef(() => UserModule), forwardRef(() => StudentModule)],
    providers: [TutorialService],
    controllers: [TutorialController],
    exports: [TutorialService],
})
export class TutorialModule {}
