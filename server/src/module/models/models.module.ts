import {
  Module,
  Global,
  OnModuleInit,
  OnApplicationBootstrap,
  DynamicModule,
} from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { AttendanceModel } from './attendance.model';
import { GradingModel } from './grading.model';
import { StudentModel } from './student.model';
import { TeamModel } from './team.model';
import { TutorialModel } from './tutorial.model';
import { UserModel } from './user.model';
import { ExerciseModel, SubexerciseModel } from './exercise.model';
import { SheetModel } from './sheet.model';

@Global()
@Module({})
export class ModelsModule {
  static init(): DynamicModule {
    const moduleWithModels = TypegooseModule.forFeature([
      AttendanceModel,
      GradingModel,
      StudentModel,
      TeamModel,
      TutorialModel,
      UserModel,
      SheetModel,
      ExerciseModel,
      SubexerciseModel, // TODO: Needed?
    ]);

    return {
      module: ModelsModule,
      imports: [moduleWithModels],
      exports: [moduleWithModels],
    };
  }
}
