import { arrayProp, DocumentType, modelOptions, plugin, prop } from '@typegoose/typegoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { CollectionName } from '../../helpers/CollectionName';
import VirtualPopulation, { VirtualPopulationOptions } from '../plugins/VirtualPopulation';
import { StudentDocument } from './student.model';
import { TutorialDocument, TutorialModel } from './tutorial.model';
import { NoFunctions } from '../../helpers/NoFunctions';
import { Team } from '../../shared/model/Team';

/**
 * Populates the fields in the given TeamDocument. If no document is provided this functions does nothing.
 *
 * @param doc TeamDocument to populate.
 */
export async function populateTeamDocument(doc?: TeamDocument) {
  if (!doc) {
    return;
  }

  await doc.populate('students').execPopulate();
}

type AssignableFields = Omit<NoFunctions<TeamModel>, 'students'>;

@plugin(mongooseAutoPopulate)
@plugin<VirtualPopulationOptions<TeamModel>>(VirtualPopulation, {
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

  @arrayProp({
    ref: 'StudentModel',
    foreignField: 'team',
    localField: '_id',
  })
  students!: StudentDocument[];

  toDTO(this: TeamDocument): Team {
    const { id, students, teamNo, tutorial } = this;

    return {
      id,
      students: students.map(s => s.id),
      teamNo,
      tutorial: tutorial.id,
      points: {}, // TODO: Add the correct points for the whole team
    };
  }
}

export type TeamDocument = DocumentType<TeamModel>;
