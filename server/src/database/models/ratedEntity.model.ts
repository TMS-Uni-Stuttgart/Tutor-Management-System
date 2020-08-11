import { DocumentType, prop } from '@typegoose/typegoose';
import { RatedEntityDTO } from '../../module/scheinexam/scheinexam.dto';
import { ExercisePointInfo } from '../../shared/model/Gradings';
import { IRatedEntity } from '../../shared/model/RatedEntity';
import { ExerciseDocument, ExerciseModel, HasExerciseDocuments } from './exercise.model';
import { StudentDocument } from './student.model';

interface PassedInformation {
  passed: boolean;
  achieved: number;
  total: ExercisePointInfo;
}

export class RatedEntityModel implements HasExerciseDocuments {
  @prop({ required: true, type: ExerciseModel })
  exercises!: ExerciseDocument[];

  @prop({ required: true })
  percentageNeeded!: number;

  get totalPoints(): ExercisePointInfo {
    return this.exercises.reduce(
      (sum, current: ExerciseDocument) => {
        const ptInfoEx = current.pointInfo;

        return {
          must: sum.must + ptInfoEx.must,
          bonus: sum.bonus + ptInfoEx.bonus,
        };
      },
      { must: 0, bonus: 0 }
    );
  }

  static fromDTO(dto: RatedEntityDTO): RatedEntityModel {
    return this.assignDTO(new RatedEntityModel(), dto);
  }

  protected static assignDTO(model: RatedEntityModel, dto: RatedEntityDTO): RatedEntityModel {
    const { exercises, percentageNeeded } = dto;

    model.exercises = exercises.map((ex) => ExerciseModel.fromDTO(ex) as ExerciseDocument);
    model.percentageNeeded = percentageNeeded;

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
    return {
      id: this.id,
      percentageNeeded: this.percentageNeeded,
      exercises: this.exercises.map((ex) => ex.toDTO()),
    };
  }
}

export type RatedEntityDocument = DocumentType<RatedEntityModel>;
