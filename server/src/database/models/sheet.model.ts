import { arrayProp, DocumentType, modelOptions, plugin, prop } from '@typegoose/typegoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { CollectionName } from '../../helpers/CollectionName';
import { ISheet } from '../../shared/model/Sheet';
import { ExerciseDocument, ExerciseModel } from './exercise.model';

interface ConstructorFields {
  sheetNo: number;
  bonusSheet: boolean;
  exercises: ExerciseModel[];
}

@plugin(mongooseAutoPopulate)
@modelOptions({ schemaOptions: { collection: CollectionName.SHEET } })
export class SheetModel {
  constructor(fields: ConstructorFields) {
    const { exercises, ...rest } = fields;
    Object.assign(this, rest);

    this.exercises = exercises.map(ex => ExerciseModel.fromDTO(ex) as ExerciseDocument);
  }

  @prop({ required: true })
  sheetNo!: number;

  @prop({ required: true })
  bonusSheet!: boolean;

  @arrayProp({ required: true, items: ExerciseModel })
  exercises!: ExerciseDocument[];

  get totalPoints(): number {
    return this.exercises.reduce(
      (sum: number, current: ExerciseDocument) => sum + current.maxPoints,
      0
    );
  }

  toDTO(this: SheetDocument): ISheet {
    return {
      id: this.id,
      sheetNo: this.sheetNo,
      bonusSheet: this.bonusSheet,
      exercises: this.exercises.map(ex => ex.toDTO()),
    };
  }
}

export type SheetDocument = DocumentType<SheetModel>;
