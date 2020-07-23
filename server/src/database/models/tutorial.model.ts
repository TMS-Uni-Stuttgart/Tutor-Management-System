import { DocumentType, modelOptions, plugin, prop } from '@typegoose/typegoose';
import { DateTime, ToISOTimeOptions } from 'luxon';
import { Schema } from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { CollectionName } from '../../helpers/CollectionName';
import { NoFunctions } from '../../helpers/NoFunctions';
import { ITutorial, UserInEntity } from '../../shared/model/Tutorial';
import VirtualPopulation, { VirtualPopulationOptions } from '../plugins/VirtualPopulation';
import { StudentDocument } from './student.model';
import { TeamDocument } from './team.model';
import { UserDocument, UserModel } from './user.model';

/**
 * Populates the fields in the given TutorialDocument. If no document is provided this functions does nothing.
 *
 * @param doc TutorialDocument to populate.
 */
export async function populateTutorialDocument(doc?: TutorialDocument): Promise<void> {
  if (!doc || !doc.populate) {
    return;
  }

  await doc.populate('students').populate('teams').execPopulate();

  doc.loadSubstituteMap();
}

type AssignableFields = Omit<NoFunctions<TutorialModel>, 'students' | 'teams'>;

export class SubstituteModel {
  @prop({ required: true })
  date!: string;

  @prop({ ref: UserModel, autopopulate: true, required: true })
  user!: UserDocument;
}

type SubstituteDocument = DocumentType<SubstituteModel>;

@plugin(mongooseAutoPopulate)
@plugin<typeof VirtualPopulation, VirtualPopulationOptions<TutorialModel>>(VirtualPopulation, {
  populateDocument: populateTutorialDocument,
})
@modelOptions({ schemaOptions: { collection: CollectionName.TUTORIAL } })
export class TutorialModel {
  constructor(fields: AssignableFields) {
    Object.assign(this, fields);

    this.students = [];
    this.teams = [];

    this.substitutes = new Map();
  }

  @prop({ required: true })
  slot!: string;

  @prop({ ref: 'UserModel', autopopulate: true })
  tutor?: UserDocument;

  @prop({ required: true, type: Schema.Types.String })
  private _dates!: string[];

  get dates(): DateTime[] {
    return this._dates.map((date) => DateTime.fromISO(date));
  }

  set dates(dates: DateTime[]) {
    this._dates = dates.map((date) => date.toISODate());
  }

  @prop({ required: true })
  private _startTime!: string;

  get startTime(): DateTime {
    return DateTime.fromISO(this._startTime);
  }

  set startTime(startTime: DateTime) {
    this._startTime = startTime.startOf('minute').toISOTime({ suppressMilliseconds: true });
  }

  @prop({ required: true })
  private _endTime!: string;

  get endTime(): DateTime {
    return DateTime.fromISO(this._endTime);
  }

  set endTime(endTime: DateTime) {
    this._endTime = endTime.startOf('minute').toISOTime({ suppressMilliseconds: true });
  }

  @prop({
    ref: 'StudentModel',
    foreignField: 'tutorial',
    localField: '_id',
  })
  students!: StudentDocument[];

  @prop({
    ref: 'TeamModel',
    foreignField: 'tutorial',
    localField: '_id',
  })
  teams!: TeamDocument[];

  @prop({ ref: 'UserModel', autopopulate: true, default: [] })
  correctors!: UserDocument[];

  @prop({ type: SubstituteModel, autopopulate: true, default: [] })
  private _substitutes!: SubstituteDocument[];

  private substitutes?: Map<string, UserDocument>;

  loadSubstituteMap(): void {
    this.substitutes = new Map();

    for (const doc of this._substitutes) {
      this.substitutes.set(doc.date, doc.user);
    }
  }

  saveSubstituteMap(this: TutorialDocument): void {
    if (!this.substitutes) {
      return;
    }

    this._substitutes = [];

    for (const [date, user] of this.substitutes) {
      this._substitutes.push({
        date,
        user,
      } as any);
    }

    this.markModified('_substitutes');
  }

  /**
   * Sets the substitute of the given date to the given user.
   *
   * If there already is a substitute at that date that substitute will be overridden.
   *
   * @param date Date of the substitute
   * @param substitute Substitute
   */
  setSubstitute(this: TutorialDocument, date: DateTime, substitute: UserDocument): void {
    this.substitutes?.set(this.getDateKey(date), substitute);

    this.saveSubstituteMap();
  }

  /**
   * Removes the substitute from the given date.
   *
   * If there was no substitute saved for that day this function is a no-op.
   *
   * @param date Date to remove the substitute from
   */
  removeSubstitute(this: TutorialDocument, date: DateTime): void {
    const key = this.getDateKey(date);

    if (this.substitutes?.has(key)) {
      this.substitutes?.delete(key);
      this.saveSubstituteMap();
    }
  }

  /**
   * Returns the substitute of the given date.
   *
   * If there is a substitute saved for the given date that substitue is returned. If there is none, `undefined` is returned.
   *
   * @param date Date to get the substitute.
   * @returns The corresponding user, if there is a substitute at the given date, else `undefined`.
   */
  getSubstitute(date: DateTime): UserDocument | undefined {
    return this.substitutes?.get(this.getDateKey(date));
  }

  getAllSubstitutes(): Map<string, UserDocument> {
    if (!this.substitutes) {
      this.loadSubstituteMap();
    }

    return this.substitutes ?? new Map();
  }

  /**
   * @param teams Teams related to the tutorial.
   *
   * @returns The DTO representation of this document.
   */
  toDTO(this: TutorialDocument): ITutorial {
    const { id, slot, tutor, dates, startTime, endTime, students, correctors, teams } = this;
    const substitutes: Map<string, UserInEntity> = new Map();

    for (const [date, doc] of this.substitutes?.entries() ?? []) {
      substitutes.set(date, { id: doc.id, firstname: doc.firstname, lastname: doc.lastname });
    }

    const dateOptions: ToISOTimeOptions = {
      suppressMilliseconds: true,
    };

    return {
      id,
      slot,
      tutor: tutor
        ? { id: tutor.id, firstname: tutor.firstname, lastname: tutor.lastname }
        : undefined,
      dates: dates.map((date) => date.toISODate()),
      startTime: startTime.toISOTime(dateOptions),
      endTime: endTime.toISOTime(dateOptions),
      students: students.map((student) => student.id),
      correctors: correctors.map((corrector) => ({
        id: corrector.id,
        firstname: corrector.firstname,
        lastname: corrector.lastname,
      })),
      substitutes: [...substitutes],
      teams: teams.map((team) => team.id),
    };
  }

  private getDateKey(date: DateTime): string {
    return date.toISODate();
  }
}

export type TutorialDocument = DocumentType<TutorialModel>;
