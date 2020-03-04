import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { AttendanceCriteria } from './container/criterias/AttendanceCriteria';
import { PresentationCriteria } from './container/criterias/PresentationCriteria';
import { ScheinexamCriteria } from './container/criterias/ScheinexamCriteria';
import { SheetIndividualCriteria } from './container/criterias/SheetIndividualCriteria';
import { SheetTotalCriteria } from './container/criterias/SheetTotalCriteria';
import { Scheincriteria } from './container/Scheincriteria';
import { ScheincriteriaContainer } from './container/scheincriteria.container';
import { ScheincriteriaService } from './scheincriteria.service';
import { ScheincriteriaController } from './scheincriteria.controller';
import { StudentModule } from '../student/student.module';
import { SheetModule } from '../sheet/sheet.module';
import { ScheinexamModule } from '../scheinexam/scheinexam.module';
import { TutorialModule } from '../tutorial/tutorial.module';

export type ScheincriteriaConstructor = new (...args: any[]) => Scheincriteria;

@Module({
  imports: [StudentModule, SheetModule, ScheinexamModule, TutorialModule],
  providers: [ScheincriteriaService],
  controllers: [ScheincriteriaController],
  exports: [ScheincriteriaService],
})
export class ScheincriteriaModule implements OnModuleInit {
  onModuleInit() {
    const criterias: ScheincriteriaConstructor[] = [
      AttendanceCriteria,
      PresentationCriteria,
      SheetIndividualCriteria,
      SheetTotalCriteria,
      ScheinexamCriteria,
    ];

    criterias.forEach(criteria => this.registerCriteria(criteria));
  }

  /**
   * Registers the given criteria to the `ScheincriteriaContainer`.
   *
   * This way it can be accessed later as a blue print. The actual saved data in the criterias passed to this do _not_ matter. They only serve as 'blueprints'.
   *
   * @param criteria Criteria to register to the `ScheincriteriaContainer`.
   */
  private registerCriteria(criteriaConstructor: ScheincriteriaConstructor) {
    const criteria = new criteriaConstructor();
    const logContext = ScheincriteriaModule.name;
    const container = ScheincriteriaContainer.getContainer();
    const identifier = criteria.identifier;

    Logger.log(`Registering scheincriteria '${identifier}'...`, logContext);

    container.registerBluePrint(criteria);

    Logger.log(`Scheincriteria ${identifier} registered`, logContext);
  }
}
