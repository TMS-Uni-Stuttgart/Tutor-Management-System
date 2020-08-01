import { DocumentType, modelOptions, plugin, prop } from '@typegoose/typegoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { CollectionName } from '../../helpers/CollectionName';
import { NoFunctions } from '../../helpers/NoFunctions';
import { ITeam } from '../../shared/model/Team';
import VirtualPopulation, { VirtualPopulationOptions } from '../plugins/VirtualPopulation';
import { populateStudentDocument, StudentDocument } from './student.model';
import { TutorialDocument, TutorialModel } from './tutorial.model';

/**
 * Populates the fields in the given TeamDocument. If no document is provided this functions does nothing.
 *
 * @param doc TeamDocument to populate.
 */
export async function populateTeamDocument(doc?: TeamDocument): Promise<void> {
  if (!doc) {
    return;
  }

  await doc.populate('students').execPopulate();
  await Promise.all(doc.students.map((student) => populateStudentDocument(student)));
}

type AssignableFields = Omit<NoFunctions<TeamModel>, 'students'>;

@plugin(mongooseAutoPopulate)
@plugin<typeof VirtualPopulation, VirtualPopulationOptions<TeamModel>>(VirtualPopulation, {
  populateDocument: populateTeamDocument,
})
@modelOptions({ schemaOptions: { collection: CollectionName.TEAM } })
export class TeamModel {
  constructor(fields: AssignableFields) {
    Object.assign(this, fields);

    this.students = [];
  }

  @prop({ required: true })
  teamNo!: number;

  @prop({ required: true, autopopulate: true, ref: TutorialModel })
  tutorial!: TutorialDocument;

  @prop({
    ref: 'StudentModel',
    foreignField: 'team',
    localField: '_id',
  })
  students!: StudentDocument[];

  toDTO(this: TeamDocument): ITeam {
    const { id, students, teamNo, tutorial } = this;

    return {
      id,
      students: students.map((s) => s.toDTO()),
      teamNo,
      tutorial: tutorial.id,
    };
  }
}

export type TeamDocument = DocumentType<TeamModel>;
