import {
    Collection,
    Entity,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryKey,
    Property,
} from '@mikro-orm/core';
import { DateTime, Interval, ToISOTimeOptions } from 'luxon';
import { ITutorialInEntity } from 'shared/model/Common';
import { ITutorial } from 'shared/model/Tutorial';
import { v4 } from 'uuid';
import { LuxonDateArrayType } from '../types/LuxonDateType';
import { LuxonTimeType } from '../types/LuxonTimeType';
import { Student } from './student.entity';
import { Substitute } from './substitute.entity';
import { Team } from './team.entity';
import { User } from './user.entity';

@Entity()
export class Tutorial {
    @PrimaryKey()
    id = v4();

    @Property()
    slot: string;

    @Property({ type: LuxonDateArrayType })
    dates: DateTime[];

    @Property({ type: LuxonTimeType })
    startTime: DateTime;

    @Property({ type: LuxonTimeType })
    endTime: DateTime;

    @ManyToOne()
    tutor?: User;

    @OneToMany(() => Student, (student) => student.tutorial, { eager: true })
    students = new Collection<Student>(this);

    @ManyToMany({ entity: () => User, mappedBy: 'tutorialsToCorrect', eager: true })
    correctors = new Collection<User>(this);

    @OneToMany(() => Team, (team) => team.tutorial, { eager: true })
    teams = new Collection<Team>(this);

    @OneToMany(() => Substitute, (substitute) => substitute.tutorialToSubstitute, { eager: true })
    substitutes = new Collection<Substitute>(this);

    constructor(params: TutorialParams) {
        this.slot = params.slot;
        this.dates = [...params.dates];
        this.startTime = params.startTime;
        this.endTime = params.endTime;
    }

    getStudents(): Student[] {
        return this.students.getItems();
    }

    toDTO(): ITutorial {
        const dateOptions: ToISOTimeOptions = { suppressMilliseconds: true };
        return {
            id: this.id,
            slot: this.slot,
            tutor: this.tutor?.toInEntity(),
            dates: this.dates.map((date) => date.toISODate() ?? 'DATE_NOT_PARSEABLE'),
            startTime: this.startTime.toISOTime(dateOptions) ?? 'DATE_NOT_PARSEABLE',
            endTime: this.endTime.toISOTime(dateOptions) ?? 'DATE_NOT_PARSEABLE',
            students: this.students.getItems().map((student) => student.id),
            correctors: this.correctors.getItems().map((corrector) => corrector.toInEntity()),
            substitutes: this.getSubstitutesForDTO(),
            teams: this.teams.getItems().map((team) => team.id),
        };
    }

    toInEntity(): ITutorialInEntity {
        return {
            id: this.id,
            slot: this.slot,
            weekday: this.dates[0].weekday,
            time: Interval.fromDateTimes(this.startTime, this.endTime).toISO(),
        };
    }

    private getSubstitutesForDTO(): [string, string][] {
        return this.substitutes
            .getItems()
            .map(({ date, substituteTutor }) => [date.toISODate(), substituteTutor.id]);
    }
}

interface TutorialParams {
    slot: string;
    dates: DateTime[];
    startTime: DateTime;
    endTime: DateTime;
}
