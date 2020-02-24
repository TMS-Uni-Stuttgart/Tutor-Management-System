import { DocumentType, mongoose, prop } from '@typegoose/typegoose';
import { generateObjectId } from '../../../test/helpers/test.helpers';
import { ExerciseDTO, SubExerciseDTO } from '../../module/sheet/sheet.dto';
import { Exercise, Subexercise } from '../../shared/model/Sheet';

interface SubExerciseConstructorFields {
  exName: string;
  bonus: boolean;
  maxPoints: number;
}

interface ExerciseConstructorFields extends SubExerciseConstructorFields {
  subexercises?: SubExerciseModel[];
}

export class SubExerciseModel {
  constructor(fields: SubExerciseConstructorFields) {
    Object.assign(this, fields);

    this._id = mongoose.Types.ObjectId(generateObjectId());
  }

  @prop()
  _id: mongoose.Types.ObjectId;

  get id() {
    return this._id.toHexString();
  }

  @prop({ required: true })
  exName!: string;

  @prop({ required: true })
  bonus!: boolean;

  @prop({ required: true })
  maxPoints!: number;

  static fromDTO(dto: SubExerciseDTO): SubExerciseModel {
    return new SubExerciseModel({ ...dto });
  }

  toDTO(this: SubExerciseDocument): Subexercise {
    return {
      id: this.id,
      bonus: this.bonus,
      exName: this.exName,
      maxPoints: this.maxPoints,
    };
  }
}

export class ExerciseModel {
  constructor(fields: ExerciseConstructorFields) {
    Object.assign(this, fields);
  }

  @prop({ required: true })
  exName!: string;

  @prop({ required: true })
  bonus!: boolean;

  @prop({ required: true })
  maxPoints!: number;

  @prop({ default: [], items: SubExerciseModel })
  subexercises!: SubExerciseDocument[];

  static fromDTO(dto: ExerciseDTO): ExerciseModel {
    const { exName, bonus, maxPoints, subexercises } = dto;
    const subExModels = subexercises?.map(sub => SubExerciseModel.fromDTO(sub));

    return new ExerciseModel({
      exName,
      bonus,
      maxPoints,
      subexercises: subExModels ?? [],
    });
  }

  toDTO(this: ExerciseDocument): Exercise {
    return {
      id: this.id,
      bonus: this.bonus,
      exName: this.exName,
      maxPoints: this.maxPoints,
      subexercises: this.subexercises.map(ex => ex.toDTO()),
    };
  }
}

export type ExerciseDocument = DocumentType<ExerciseModel>;
export type SubExerciseDocument = DocumentType<SubExerciseModel>;
