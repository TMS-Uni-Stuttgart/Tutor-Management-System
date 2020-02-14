import { arrayProp, DocumentType, mapProp, modelOptions, plugin, prop } from '@typegoose/typegoose';
import { Schema } from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { UserDocument } from './user.model';
import { StudentDocument } from './student.model';
import { CollectionName } from '../../helpers/CollectionName';

@plugin(mongooseAutoPopulate)
@modelOptions({ schemaOptions: { collection: CollectionName.TUTORIAL } })
export class TutorialModel {
  @prop({ required: true })
  slot!: string;

  @prop({ ref: 'UserModel', autopopulate: true })
  tutor?: UserDocument;

  @arrayProp({ required: true, items: Schema.Types.Date })
  dates!: Date[];

  @prop({ required: true })
  startTime!: Date;

  @prop({ required: true })
  endTime!: Date;

  @arrayProp({ requires: true, autopopulate: true, ref: 'StudentModel' })
  students!: StudentDocument[];

  @prop({ ref: 'UserModel', autopopulate: true, default: [] })
  correctors!: UserDocument[];

  @mapProp({ of: 'UserModel', autopopulate: true, default: new Map() })
  private substitutes!: Map<string, UserDocument>;

  /**
   * Sets the substitute of the given date to the given user.
   *
   * If there already is a substitute at that date that substitute will be overridden.
   *
   * @param date Date of the substitute
   * @param substitute Substitute
   */
  setSubstitute(date: Date, substitute: UserDocument) {
    this.substitutes.set(this.getDateKey(date), substitute);
  }

  /**
   * Removes the substitute from the given date.
   *
   * If there was no substitute saved for that day this function is a no-op.
   *
   * @param date Date to remove the substitute from
   */
  removeSubstitute(date: Date) {
    this.substitutes.delete(this.getDateKey(date));
  }

  /**
   * Returns the substitute of the given date.
   *
   * If there is a substitute saved for the given date that substitue is returned. If there is none, `undefined` is returned.
   *
   * @param date Date to get the substitute.
   * @returns The corresponding user, if there is a substitute at the given date, else `undefined`.
   */
  getSubstitute(date: Date): UserDocument | undefined {
    return this.substitutes.get(this.getDateKey(date));
  }

  private getDateKey(date: Date): string {
    return date.toJSON();
  }
}

export type TutorialDocument = DocumentType<TutorialModel>;
