import {
    Collection,
    Entity,
    Enum,
    ManyToMany,
    ManyToOne,
    PrimaryKey,
    Property,
} from '@mikro-orm/core';
import { StudentStatus } from 'shared/model/Student';
import { v4 } from 'uuid';
import { MapType } from '../types/MapType';
import { Grading } from './grading.entity';
import { Team } from './team.entity';
import { Tutorial } from './tutorial.entity';

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

    @ManyToOne()
    tutorial?: Tutorial;

    @ManyToOne()
    team?: Team;

    @ManyToMany(() => Grading, 'students', { owner: true })
    gradings = new Collection<Grading>(this);
}
