import {
  arrayProp,
  instanceMethod,
  InstanceType,
  isDocument,
  prop,
  Ref,
  Typegoose,
} from '@hasezoey/typegoose';
import { Document } from 'mongoose';
import { PointMapDTO } from 'shared/dist/model/Points';
import { Team } from 'shared/dist/model/Team';
import { getIdOfDocumentRef } from '../../helpers/documentHelpers';
import Logger from '../../helpers/Logger';
import studentService from '../../services/student-service/StudentService.class';
import tutorialService from '../../services/tutorial-service/TutorialService.class';
import { StudentDocument } from './StudentDocument';
import { TutorialDocument } from './TutorialDocument';

export class TeamSchema extends Typegoose
  implements Omit<Team, 'id' | 'tutorial' | 'students' | 'points'> {
  @prop({ required: true })
  teamNo!: number;

  @prop({ required: true, ref: { name: 'TutorialSchema' } })
  tutorial!: Ref<TutorialDocument>;

  @arrayProp({ required: true, itemsRef: { name: 'StudentSchema' } })
  students!: Ref<StudentDocument>[];

  @prop({ default: {} })
  points!: PointMapDTO;

  /**
   * Returns all existing documents of students in this team.
   *
   * Retrieves all `StudentDocuments` from all students of this team. If a `StudentDocument` does not exist (anymore) it will be removed from this team. Afterwards this team's tutorial will be updated accordingly. All of this is done if necessary before the documents are finally returned.
   *
   * @returns `StudentDocuments` of all students which still exist in the DB.
   */
  @instanceMethod
  async getStudents(this: InstanceType<TeamSchema>): Promise<StudentDocument[]> {
    const studentDocs: StudentDocument[] = [];
    const studentsToRemove: string[] = [];

    for (const student of this.students) {
      try {
        if (isDocument(student)) {
          studentDocs.push(student);
        } else {
          studentDocs.push(await studentService.getDocumentWithId(student.toString()));
        }
      } catch {
        Logger.error(
          `[TeamDocument] Student with id ${getIdOfDocumentRef(
            student
          )} does not exist in the DB (anymore). It gets removed from the team.`
        );
        studentsToRemove.push(getIdOfDocumentRef(student));
      }
    }

    if (studentsToRemove.length > 0) {
      this.students = this.students.filter(s => !studentsToRemove.includes(getIdOfDocumentRef(s)));

      const tutorial = isDocument(this.tutorial)
        ? this.tutorial
        : await tutorialService.getDocumentWithID(this.tutorial.toString());
      const idx = tutorial.teams.findIndex(t => t.id === this.id);

      tutorial.teams.set(idx, this);
      tutorial.save();
    }

    return studentDocs;
  }

  /**
   * Checks if the given student is a member of this team.
   *
   * @param student Student to check.
   * @returns Is student a member of this team?
   */
  @instanceMethod
  isStudentMember(student: StudentDocument): boolean {
    for (const s of this.students) {
      if (getIdOfDocumentRef(s) === student.id) {
        return true;
      }
    }

    return false;
  }
}

export interface TeamDocument extends TeamSchema, Document {}
