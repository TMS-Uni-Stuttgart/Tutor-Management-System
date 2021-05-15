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
import { LuxonDateType } from '../types/LuxonDateType';
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

    @Property({ type: new LuxonDateType({ array: true }) })
    dates: DateTime[];

    @Property({ type: LuxonTimeType })
    startTime: DateTime;

    @Property({ type: LuxonTimeType })
    endTime: DateTime;

    @ManyToOne()
    tutor?: User;

    @OneToMany(() => Student, (student) => student.tutorial)
    students = new Collection<Student>(this);

    @ManyToMany(() => User, 'tutorialsToCorrect')
    correctors = new Collection<User>(this);

    @OneToMany(() => Team, (team) => team.tutorial)
    teams = new Collection<Team>(this);

    // TODO: Substitutes!
    // Relation Tutorial-User: n:1 with `date` property.
    @OneToMany(() => Substitute, (substitute) => substitute.tutorialToSubstitute)
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
            startTime: this.startTime.toISOTime(dateOptions) ?? 'DATE_NOT_PARSABLE',
            endTime: this.endTime.toISOTime(dateOptions) ?? 'DATE_NOT_PARSEBALE',
            students: this.students.getItems().map((student) => student.id),
            correctors: this.correctors.getItems().map((corrector) => corrector.toInEntity()),
            substitutes: [], // TODO: After implementing substitutes: Add them to DTO
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
}

interface TutorialParams {
    slot: string;
    dates: DateTime[];
    startTime: DateTime;
    endTime: DateTime;
}
