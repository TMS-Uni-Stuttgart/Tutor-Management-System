import {
    Collection,
    Entity,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryKey,
    Property,
} from '@mikro-orm/core';
import { DateTime, Interval } from 'luxon';
import { ITutorialInEntity } from 'shared/model/Common';
import { v4 } from 'uuid';
import { LuxonDateType } from '../types/LuxonDateType';
import { LuxonTimeType } from '../types/LuxonTimeType';
import { Student } from './student.entity';
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

    // TODO: Substitutes!
    // Relation Tutorial-User: n:1 with `date` property.

    constructor(params: TutorialParams) {
        this.slot = params.slot;
        this.dates = [...params.dates];
        this.startTime = params.startTime;
        this.endTime = params.endTime;
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
