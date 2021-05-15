import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { LuxonDateType } from '../types/LuxonDateType';
import { Tutorial } from './tutorial.entity';
import { User } from './user.entity';

@Entity()
export class Substitute {
    @ManyToOne()
    substituteTutor: User;

    @PrimaryKey()
    @ManyToOne()
    tutorialToSubstitute: Tutorial;

    @PrimaryKey()
    @Property({ type: LuxonDateType })
    date: DateTime;

    constructor(params: SubstituteParams) {
        this.substituteTutor = params.substituteTutor;
        this.tutorialToSubstitute = params.tutorialToSubstitute;
        this.date = params.date.startOf('day');
    }
}

interface SubstituteParams {
    substituteTutor: User;
    tutorialToSubstitute: Tutorial;
    date: DateTime;
}
