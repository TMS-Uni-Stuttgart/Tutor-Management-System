import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Student } from './student.entity';

@Entity()
export class Team {
    @PrimaryKey()
    id = v4();

    @Property()
    teamNo!: number;

    @OneToMany(() => Student, (student) => student.team)
    students = new Collection<Student>(this);
}
