import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { v4 } from 'uuid';

@Entity()
export class Tutorial {
    @PrimaryKey()
    id = v4();

    @Property()
    slot!: string;

    // TODO: Make special DateTimeArrayType to handle luxon dates with mikro.
    @Property()
    dates!: DateTime[];

    @Property()
    startTime!: DateTime;

    @Property()
    endTime!: DateTime;
}
