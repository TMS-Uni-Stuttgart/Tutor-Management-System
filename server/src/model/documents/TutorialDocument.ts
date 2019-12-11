import {
  arrayProp,
  DocumentType,
  getModelForClass,
  mapProp,
  prop,
  Ref,
} from '@typegoose/typegoose';
import { Model, Schema, Types } from 'mongoose';
import { Tutorial } from 'shared/dist/model/Tutorial';
import { getIdOfDocumentRef } from '../../helpers/documentHelpers';
import Logger from '../../helpers/Logger';
import studentService from '../../services/student-service/StudentService.class';
import { CollectionName } from '../CollectionName';
import { StudentDocument } from './StudentDocument';
import { TeamDocument, TeamSchema } from './TeamDocument';
import { UserDocument } from './UserDocument';

export class TutorialSchema
  implements
    Omit<Tutorial, 'id' | 'tutor' | 'correctors' | 'students' | 'teams' | 'substitutes' | 'dates'> {
  @prop({ required: true })
  slot!: string;

  @prop({ ref: { name: 'UserSchema' } })
  tutor?: Ref<UserDocument>;

  @arrayProp({ required: true, items: Schema.Types.Date })
  dates!: Date[];

  @prop({ required: true })
  startTime!: Date;

  @prop({ required: true })
  endTime!: Date;

  @arrayProp({ required: true, itemsRef: { name: 'StudentSchema' } })
  students!: Ref<StudentDocument>[];

  @arrayProp({ required: true, items: TeamSchema })
  teams!: Types.Array<TeamDocument>;

  @arrayProp({ required: true, itemsRef: { name: 'UserSchema' } })
  correctors!: Ref<UserDocument>[];

  @mapProp({ of: String, default: {} })
  substitutes?: Types.Map<string>;

  isTutor(this: DocumentType<TutorialSchema>, user: UserDocument): boolean {
    if (!this.tutor) {
      return false;
    }

    return getIdOfDocumentRef(this.tutor) === user.id;
  }

  isSubstitute(this: DocumentType<TutorialSchema>, user: UserDocument): boolean {
    if (!this.substitutes) {
      return false;
    }

    for (const subst of this.substitutes.values()) {
      if (subst === user.id) {
        return true;
      }
    }

    return false;
  }

  isCorrector(this: DocumentType<TutorialSchema>, user: UserDocument): boolean {
    for (const corrector of this.correctors) {
      if (getIdOfDocumentRef(corrector) === user.id) {
        return true;
      }
    }

    return false;
  }

  async getStudents(this: DocumentType<TutorialDocument>): Promise<StudentDocument[]> {
    const studentDocs: StudentDocument[] = [];
    const studentsToRemove: string[] = [];

    await Promise.all(
      this.students.map(student =>
        studentService
          .getDocumentWithId(getIdOfDocumentRef(student))
          .then(doc => studentDocs.push(doc))
          .catch(() => {
            Logger.error(
              `[TutorialDocument] Student with ID ${getIdOfDocumentRef(
                student
              )} does not exist in the DB (anymore). It gets removed from the tutorial.`
            );

            studentsToRemove.push(getIdOfDocumentRef(student));
          })
      )
    );

    if (studentsToRemove.length > 0) {
      this.students = this.students.filter(s => !studentsToRemove.includes(getIdOfDocumentRef(s)));

      await this.save();
    }

    return studentDocs;
  }
}

export type TutorialDocument = DocumentType<TutorialSchema>;

const TutorialModel: Model<TutorialDocument> = getModelForClass(TutorialSchema, {
  schemaOptions: { collection: CollectionName.TUTORIAL },
});

export default TutorialModel;
