import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { v4 } from 'uuid';
import { LuxonDateType } from '../types/LuxonDateType';
import { LuxonTimeType } from '../types/LuxonTimeType';

@Entity()
export class Tutorial {
    @PrimaryKey()
    id = v4();

    @Property()
    slot!: string;

    @Property({ type: new LuxonDateType({ array: true }) })
    dates!: DateTime[];

    @Property({ type: LuxonTimeType })
    startTime!: DateTime;

    @Property({ type: LuxonTimeType })
    endTime!: DateTime;
}
