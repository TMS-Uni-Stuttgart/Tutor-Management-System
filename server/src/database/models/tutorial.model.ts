import { DocumentType, modelOptions, plugin, prop } from '@typegoose/typegoose';
import { DateTime, ToISOTimeOptions } from 'luxon';
import { Schema } from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { CollectionName } from '../../helpers/CollectionName';
import { NoFunctions } from '../../helpers/NoFunctions';
import { ITutorial } from '../../shared/model/Tutorial';
import { StudentDocument } from './student.model';
import { TeamDocument } from './team.model';
import { UserDocument } from './user.model';

type AssignableFields = Omit<NoFunctions<TutorialModel>, 'students' | 'teams'>;

@plugin(mongooseAutoPopulate)
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

  @prop({ ref: 'UserModel', autopopulate: { maxDepth: 1 } })
  tutor?: UserDocument;

  @prop({ required: true, type: Schema.Types.String })
  private _dates!: string[];

  get dates(): DateTime[] {
    return this._dates.map((date) => DateTime.fromISO(date));
  }

  set dates(dates: DateTime[]) {
    this._dates = dates
      .map((date) => date.toISODate())
      .filter((val): val is string => val !== null);
  }

  @prop({ required: true })
  private _startTime!: string;

  get startTime(): DateTime {
    return DateTime.fromISO(this._startTime);
  }

  set startTime(startTime: DateTime) {
    const time = startTime.startOf('minute').toISOTime({ suppressMilliseconds: true });

    if (time) {
      this._startTime = time;
    }
  }

  @prop({ required: true })
  private _endTime!: string;

  get endTime(): DateTime {
    return DateTime.fromISO(this._endTime);
  }

  set endTime(endTime: DateTime) {
    const time = endTime.startOf('minute').toISOTime({ suppressMilliseconds: true });

    if (time) {
      this._endTime = time;
    }
  }

  @prop({
    ref: 'StudentModel',
    foreignField: 'tutorial',
    localField: '_id',
    autopopulate: { maxDepth: 1 },
  })
  students!: StudentDocument[];

  @prop({
    ref: 'TeamModel',
    foreignField: 'tutorial',
    localField: '_id',
    autopopulate: { maxDepth: 1 },
  })
  teams!: TeamDocument[];

  @prop({ ref: 'UserModel', autopopulate: true, default: [] })
  correctors!: UserDocument[];

  @prop({ type: String, default: new Map() })
  private substitutes: Map<string, string>;

  /**
   * Sets the substitute of the given date to the given user.
   *
   * If there already is a substitute at that date that substitute will be overridden.
   *
   * @param date Date of the substitute
   * @param substitute Substitute
   */
  setSubstitute(this: TutorialDocument, date: DateTime, substitute: UserDocument): void {
    this.substitutes.set(this.getDateKey(date), substitute.id);
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

    if (this.substitutes.has(key)) {
      this.substitutes.delete(key);
    }
  }

  /**
   * Returns the substitute of the given date.
   *
   * If there is a substitute saved for the given date that substitue is returned. If there is none, `undefined` is returned.
   *
   * @param date Date to get the substitute.
   * @returns The corresponding user's ID, if there is a substitute at the given date, else `undefined`.
   */
  getSubstitute(date: DateTime): string | undefined {
    return this.substitutes.get(this.getDateKey(date));
  }

  /**
   * @returns A map containing the dates as keys and the corresponding substitute for that day.
   */
  getAllSubstitutes(): Map<string, string> {
    return this.substitutes;
  }

  /**
   * @param teams Teams related to the tutorial.
   *
   * @returns The DTO representation of this document.
   */
  toDTO(this: TutorialDocument): ITutorial {
    const { id, slot, tutor, dates, startTime, endTime, students, correctors, teams } = this;

    const dateOptions: ToISOTimeOptions = {
      suppressMilliseconds: true,
    };

    return {
      id,
      slot,
      tutor: tutor
        ? { id: tutor.id, firstname: tutor.firstname, lastname: tutor.lastname }
        : undefined,
      dates: dates.map((date) => date.toISODate() ?? 'DATE_NOT_PARSEABLE'),
      startTime: startTime.toISOTime(dateOptions) ?? 'DATE_NOT_PARSABLE',
      endTime: endTime.toISOTime(dateOptions) ?? 'DATE_NOT_PARSEBALE',
      students: students.map((student) => student.id),
      correctors: correctors.map((corrector) => ({
        id: corrector.id,
        firstname: corrector.firstname,
        lastname: corrector.lastname,
      })),
      substitutes: [...this.substitutes],
      teams: teams.map((team) => team.id),
    };
  }

  private getDateKey(date: DateTime): string {
    const dateKey = date.toISODate();

    if (!dateKey) {
      throw new Error(`Date '${date}' is not parseable to ISODate.`);
    }

    return dateKey;
  }
}

export type TutorialDocument = DocumentType<TutorialModel>;
