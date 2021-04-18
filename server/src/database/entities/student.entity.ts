import {
    Collection,
    Embedded,
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
import { Attendance } from './attendance.entity';
import { Grading } from './grading.entity';
import { Team } from './team.entity';
import { Tutorial } from './tutorial.entity';

@Entity()
export class Student {
    @PrimaryKey()
    id = v4();

    @Property()
    firstname: string;

    @Property()
    lastname: string;

    @Property()
    matriculationNo: string;

    @Enum(() => StudentStatus)
    status: StudentStatus;

    @Property()
    iliasName?: string;

    @Property()
    email?: string;

    @Property()
    courseOfStudies?: string;

    @Property()
    cakeCount: number = 0;

    @Property({ type: MapType })
    presentationPoints: Map<string, number> = new Map();

    @Embedded(() => Attendance, { array: true })
    attendances: Attendance[] = [];

    @ManyToOne()
    tutorial?: Tutorial;

    @ManyToOne()
    team?: Team;

    @ManyToMany(() => Grading, 'students', { owner: true })
    gradings = new Collection<Grading>(this);

    constructor(params: StudentParams) {
        this.firstname = params.firstname;
        this.lastname = params.lastname;
        this.matriculationNo = params.matriculationNo;
        this.status = params.status;
    }
}

interface StudentParams {
    firstname: string;
    lastname: string;
    matriculationNo: string;
    status: StudentStatus;
}
