import { MikroOrmModule } from '@mikro-orm/nestjs';
import { forwardRef, Module } from '@nestjs/common';
import { User } from '../../database/entities/user.entity';
import { TutorialModule } from '../tutorial/tutorial.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
    imports: [forwardRef(() => TutorialModule), MikroOrmModule.forFeature([User])],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
