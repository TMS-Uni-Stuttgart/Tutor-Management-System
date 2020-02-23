import { arrayProp, DocumentType, mapProp, modelOptions, plugin, prop } from '@typegoose/typegoose';
import { Schema } from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { CollectionName } from '../../helpers/CollectionName';
import { NoFunctions } from '../../helpers/NoFunctions';
import { Tutorial } from '../../shared/model/Tutorial';
import VirtualPopulation, { VirtualPopulationOptions } from '../plugins/VirtualPopulation';
import { StudentDocument } from './student.model';
import { TeamDocument } from './team.model';
import { UserDocument, UserModel } from './user.model';
import { DateTime } from 'luxon';

/**
 * Populates the fields in the given TutorialDocument. If no document is provided this functions does nothing.
 *
 * @param doc TutorialDocument to populate.
 */
export async function populateTutorialDocument(doc?: TutorialDocument) {
  if (!doc || !doc.populate) {
    return;
  }

  await doc
    .populate('students')
    .populate('teams')
    .execPopulate();
}

@plugin(mongooseAutoPopulate)
@plugin<VirtualPopulationOptions<TutorialModel>>(VirtualPopulation, {
  populateDocument: populateTutorialDocument,
})
@modelOptions({ schemaOptions: { collection: CollectionName.TUTORIAL } })
export class TutorialModel {
  constructor(fields: NoFunctions<TutorialModel>) {
    Object.assign(this, fields);
  }

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

  @arrayProp({
    ref: 'StudentModel',
    foreignField: 'tutorial',
    localField: '_id',
  })
  students!: StudentDocument[];

  @arrayProp({
    ref: 'TeamModel',
    foreignField: 'tutorial',
    localField: '_id',
  })
  teams!: TeamDocument[];

  @arrayProp({ ref: 'UserModel', autopopulate: true, default: [] })
  correctors!: UserDocument[];

  @mapProp({ of: UserModel, autopopulate: true, default: new Map() })
  substitutes!: Map<string, UserDocument>;

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

  /**
   * @param teams Teams related to the tutorial.
   *
   * @returns The DTO representation of this document.
   */
  toDTO(this: TutorialDocument): Tutorial {
    const { id, slot, tutor, dates, startTime, endTime, students, correctors, teams } = this;
    const substitutes: Map<string, string> = new Map();

    for (const [date, doc] of this.substitutes.entries()) {
      substitutes.set(date, doc.id);
    }

    return {
      id,
      slot,
      tutor: tutor?.id,
      dates: dates.map(date => DateTime.fromJSDate(date).toISODate()),
      startTime: DateTime.fromJSDate(startTime).toISOTime(),
      endTime: DateTime.fromJSDate(endTime).toISOTime(),
      students: students.map(student => student.id),
      correctors: correctors.map(corrector => corrector.id),
      substitutes: [...substitutes],
      teams: teams.map(team => team.id),
    };
  }

  private getDateKey(date: Date): string {
    return date.toJSON();
  }
}

export type TutorialDocument = DocumentType<TutorialModel>;
