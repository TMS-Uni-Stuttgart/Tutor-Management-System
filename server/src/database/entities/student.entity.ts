import { Entity, Enum, PrimaryKey, Property } from '@mikro-orm/core';
import { StudentStatus } from 'shared/model/Student';
import { v4 } from 'uuid';
import { MapType } from '../types/MapType';

@Entity()
export class Student {
    @PrimaryKey()
    id = v4();

    @Property()
    firstname!: string;

    @Property()
    lastname!: string;

    @Property()
    matriculationNo!: string;

    @Enum(() => StudentStatus)
    status!: StudentStatus;

    @Property()
    iliasName?: string;

    @Property()
    email?: string;

    @Property()
    courseOfStudies?: string;

    @Property()
    cakeCount: number = 0;

    @Property({ type: MapType })
    presentationPoints!: Map<string, number>;

    // TODO: Make an actual 1:n relation?
    // @Property({ type: MapType })
    // attendances!: Map<string, Attendance>;
}
