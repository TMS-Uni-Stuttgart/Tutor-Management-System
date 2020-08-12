import { DocumentType, prop } from '@typegoose/typegoose';
import { HasExercisesDTO, RatedEntityDTO } from '../../module/scheinexam/scheinexam.dto';
import { ExercisePointsInfo } from '../../shared/model/Gradings';
import { IHasExercises } from '../../shared/model/HasExercises';
import { IRatedEntity } from '../../shared/model/RatedEntity';
import { ExerciseDocument, ExerciseModel, HasExerciseDocuments } from './exercise.model';
import { StudentDocument } from './student.model';

interface PassedInformation {
  passed: boolean;
  achieved: number;
  total: ExercisePointsInfo;
}

export abstract class HasExercisesModel implements HasExerciseDocuments {
  @prop({ required: true, type: ExerciseModel })
  exercises!: ExerciseDocument[];

  get totalPoints(): ExercisePointsInfo {
    const info = this.exercises.reduce(
      (sum, current: ExerciseDocument) => {
        const ptInfoEx = current.pointInfo;

        return {
          must: sum.must + ptInfoEx.must,
          bonus: sum.bonus + ptInfoEx.bonus,
        };
      },
      { must: 0, bonus: 0 }
    );
    return new ExercisePointsInfo(info);
  }

  protected static assignDTO(model: HasExercisesModel, dto: HasExercisesDTO): HasExercisesModel {
    model.exercises = dto.exercises.map((ex) => ExerciseModel.fromDTO(ex) as ExerciseDocument);
    return model;
  }

  toDTO(this: HasExercisesDocument): IHasExercises {
    return { id: this.id, exercises: this.exercises.map((ex) => ex.toDTO()) };
  }
}

export class RatedEntityModel extends HasExercisesModel {
  @prop({ required: true })
  percentageNeeded!: number;

  static fromDTO(dto: RatedEntityDTO): RatedEntityModel {
    return this.assignDTO(new RatedEntityModel(), dto);
  }

  protected static assignDTO(model: RatedEntityModel, dto: RatedEntityDTO): RatedEntityModel {
    super.assignDTO(model, dto);

    model.percentageNeeded = dto.percentageNeeded;

    return model;
  }

  hasPassed(student: StudentDocument): PassedInformation {
    const total = this.totalPoints;
    const grading = student.getGrading(this);

    if (!grading) {
      return { passed: false, achieved: 0, total };
    }

    const achieved = grading.points;

    return {
      passed: achieved / total.must >= this.percentageNeeded,
      achieved,
      total,
    };
  }

  /**
   * Updates this document with the information provided by the given DTO.
   *
   * @param dto DTO with the new information.
   *
   * @returns `This` document for chaining abilities.
   */
  updateFromDTO(this: RatedEntityDocument, dto: RatedEntityDTO): RatedEntityDocument {
    return RatedEntityModel.assignDTO(this, dto) as RatedEntityDocument;
  }

  toDTO(this: RatedEntityDocument): IRatedEntity {
    const hasExercisesDTO = super.toDTO.bind(this)();
    return {
      ...hasExercisesDTO,
      percentageNeeded: this.percentageNeeded,
    };
  }
}

export type HasExercisesDocument = DocumentType<HasExercisesModel>;
export type RatedEntityDocument = DocumentType<RatedEntityModel>;
