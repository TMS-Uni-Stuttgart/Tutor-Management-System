import { DocumentType, modelOptions, plugin, prop, arrayProp } from '@typegoose/typegoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { CollectionName } from '../../helpers/CollectionName';
import { TutorialModel, TutorialDocument } from './tutorial.model';
import { StudentModel, StudentDocument } from './student.model';

@plugin(mongooseAutoPopulate)
@modelOptions({ schemaOptions: { collection: CollectionName.TEAM } })
export class TeamModel {
  @prop({ required: true })
  teamNo!: number;

  @prop({ required: true, autopopulate: true, ref: TutorialModel })
  tutorial!: TutorialDocument;

  // @arrayProp({ autopopulate: true, ref: StudentModel, default: [] })
  // students!: StudentDocument[];

  // /**
  //  * Adds the given student to the team.
  //  *
  //  * If this team does NOT already include that student the student's team will get set to this team and the student gets added to this team. Afterwards _only_ this document is saved.
  //  * Else the operation will not change anything.
  //  *
  //  * Please note: The related student does __NOT__ get saved by this operation.
  //  *
  //  * @param student Student to add to the team.
  //  *
  //  * @returns If the student got added the `save()` promise is returned. Else `undefined` is returned.
  //  */
  // async addStudent(this: TeamDocument, student: StudentDocument) {
  //   const idx = this.students.findIndex(s => s.id === student.id);

  //   if (idx !== -1) {
  //     return undefined;
  //   }

  //   student.team = this;
  //   this.students.push(student);

  //   return this.save();
  // }
}

export type TeamDocument = DocumentType<TeamModel>;
