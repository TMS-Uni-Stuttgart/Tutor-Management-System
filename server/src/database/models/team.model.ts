import { DocumentType, modelOptions, plugin, prop } from '@typegoose/typegoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { CollectionName } from '../../helpers/CollectionName';
import { NoFunctions } from '../../helpers/NoFunctions';
import { ITeam } from '../../shared/model/Team';
import VirtualPopulation, { VirtualPopulationOptions } from '../plugins/VirtualPopulation';
import { GradingDocument } from './grading.model';
import { SheetDocument } from './sheet.model';
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
  static generateTeamname(students: StudentDocument[]): string {
    return students
      .map((s) => s.lastname)
      .sort()
      .join('');
  }

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

  /**
   * @returns Teamname as all lastnames get combined to one string (sorted alphabetically).
   */
  getTeamName(): string {
    return TeamModel.generateTeamname(this.students);
  }

  /**
   * Returns the gradings of all students for the given sheet.
   *
   * If only one grading is assigned to the while team this one gets returned. If the students have different gradings all of those gradings are returned.
   *
   * @param sheet Sheet to get the gradings for.
   * @returns List containing all gradings related to the given sheet of the students.
   */
  getGradings(sheet: SheetDocument): GradingDocument[] {
    const gradings = new Map<string, GradingDocument>();

    this.students.forEach((student) => {
      const gradingOfStudent = student.getGrading(sheet);
      if (gradingOfStudent) {
        gradings.set(gradingOfStudent.id, gradingOfStudent);
      }
    });

    return [...gradings.values()];
  }

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
