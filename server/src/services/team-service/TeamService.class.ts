import _ from 'lodash';
import {
  PointMap,
  UpdatePointsDTO,
  PointMapEntry,
  PointId,
  getPointsOfExercise,
} from 'shared/dist/model/Points';
import { Student } from 'shared/dist/model/Student';
import { Team, TeamDTO } from 'shared/dist/model/Team';
import { isDocument } from '@hasezoey/typegoose';
import { getIdOfDocumentRef } from '../../helpers/documentHelpers';
import { TypegooseDocument } from '../../helpers/typings';
import { StudentDocument } from '../../model/documents/StudentDocument';
import { TeamDocument, TeamSchema } from '../../model/documents/TeamDocument';
import { TutorialDocument } from '../../model/documents/TutorialDocument';
import { DocumentNotFoundError, BadRequestError } from '../../model/Errors';
import sheetService from '../sheet-service/SheetService.class';
import studentService from '../student-service/StudentService.class';
import tutorialService from '../tutorial-service/TutorialService.class';

export interface PointInformation {
  id: string;
  exName: string;
  exMaxPoints: number;
  entry: PointMapEntry;
}

class TeamService {
  public async getAllTeams(tutorialId: string): Promise<Team[]> {
    const { teams: teamDocs }: TutorialDocument = await tutorialService.getDocumentWithID(
      tutorialId
    );

    const teams: Team[] = [];

    for (const doc of teamDocs) {
      teams.push(await this.getTeamOrReject(doc));
    }

    return teams;
  }

  public async createTeam(tutorialId: string, { students: studentIds }: TeamDTO): Promise<Team> {
    const tutorial = await tutorialService.getDocumentWithID(tutorialId);
    const students: StudentDocument[] = await Promise.all(
      studentIds.map(stud => studentService.getDocumentWithId(stud))
    );

    // Find the first teamNo that is available
    const teamNo: number = this.getFirstAvailableTeamNo(tutorial);
    const team: TypegooseDocument<TeamSchema> = {
      tutorial,
      students,
      points: new PointMap().toDTO(),
      teamNo,
    };
    tutorial.teams.push(team);

    await tutorial.save();

    const createdTeam = tutorial.teams[tutorial.teams.length - 1];

    for (const student of students) {
      student.team = createdTeam;
      await student.save();
    }

    return this.getTeamOrReject(createdTeam);
  }

  public async updateTeam(
    tutorialId: string,
    teamId: string,
    { students }: TeamDTO
  ): Promise<Team> {
    const [team, tutorial] = await this.getDocumentWithId(tutorialId, teamId);

    const studentsToRemove: StudentDocument[] = await Promise.all(
      _.difference(team.students.map(getIdOfDocumentRef), students).map(stud =>
        studentService.getDocumentWithId(stud)
      )
    );
    const studentsToAdd: StudentDocument[] = await Promise.all(
      _.difference(students, team.students.map(getIdOfDocumentRef)).map(stud =>
        studentService.getDocumentWithId(stud)
      )
    );

    for (const student of studentsToRemove) {
      await this.removeStudentAsMemberFromTeam(student, { saveStudent: true });
    }

    for (const student of studentsToAdd) {
      await this.makeStudentMemberOfTeam(student, team.id, { saveStudent: true });
    }

    await tutorial.save();

    return this.getTeamOrReject(team);
  }

  public async deleteTeam(tutorialId: string, teamId: string) {
    const [team, tutorial] = await this.getDocumentWithId(tutorialId, teamId);

    for (const student of team.students) {
      const doc: StudentDocument = isDocument(student)
        ? student
        : await studentService.getDocumentWithId(student.toString());

      await this.removeStudentAsMemberFromTeam(doc, { saveStudent: true });
    }

    tutorial.teams.pull({ _id: team.id });

    await tutorial.save();
  }

  public async setPoints(
    tutorialId: string,
    teamId: string,
    { id: sheetId, exercises: pointsGained }: UpdatePointsDTO
  ) {
    const [team, tutorial] = await this.getDocumentWithId(tutorialId, teamId);

    if (!(await sheetService.doesSheetWithIdExist(sheetId))) {
      return Promise.reject(
        new DocumentNotFoundError('Sheet with the given ID does not exist on the server.')
      );
    }

    const pointMapOfTeam: PointMap = new PointMap(team.points);
    const idxOfTeam = tutorial.teams.findIndex(doc => doc.id === team.id);

    if (idxOfTeam === -1) {
      throw new BadRequestError('Could not find Team in Tutorial.');
    }

    pointMapOfTeam.adjustPoints(new PointMap(pointsGained));

    team.points = pointMapOfTeam.toDTO();

    // Mongoose is not able to detect the change so we tell it that the teams array has changed...
    // See: https://mongoosejs.com/docs/schematypes.html#mixed
    tutorial.markModified('teams');
    await tutorial.save();
  }

  /**
   * Returns a list of information about the PointEntries of a team for a sheet.
   *
   * Collects all information about PointEntries of the given team for the given sheet. Empty or non-present entries will be skipped and not added to the list.
   *
   * @param tutorialId ID of the tutorial.
   * @param teamId ID of the team which infos to get.
   * @param sheetId Sheet which infos to get.
   *
   * @returns Sorted list (ascending by exercise name) of point information.
   */
  public async getPoints(
    tutorialId: string,
    teamId: string,
    sheetId: string
  ): Promise<PointInformation[]> {
    const [team] = await this.getDocumentWithId(tutorialId, teamId);
    const sheet = await sheetService.getSheetWithId(sheetId);

    const pointMap = new PointMap(team.points);
    const entries: PointInformation[] = [];

    sheet.exercises.forEach(ex => {
      const entry = pointMap.getPointEntry(new PointId(sheetId, ex));

      if (entry) {
        entries.push({ id: ex.id, exName: ex.exName, entry, exMaxPoints: getPointsOfExercise(ex) });
      }
    });

    entries.sort((a, b) => a.exName.localeCompare(b.exName));

    return entries;
  }

  public async getTeamWithId(tutorialId: string, id: string): Promise<Team> {
    const [team] = await this.getDocumentWithId(tutorialId, id);

    return this.getTeamOrReject(team);
  }

  public async getDocumentWithId(
    tutorialId: string,
    id: string
  ): Promise<[TeamDocument, TutorialDocument]> {
    const tutorial = await tutorialService.getDocumentWithID(tutorialId);
    const idx = tutorial.teams.findIndex(doc => doc.id === id);

    if (idx < 0) {
      return this.rejectTeamNotFound();
    }

    await tutorial.populate(`teams.${idx}.students`).execPopulate();

    return [tutorial.teams[idx], tutorial];
  }

  public async makeStudentMemberOfTeam(
    student: StudentDocument,
    teamId: string,
    { saveStudent }: { saveStudent?: boolean } = {}
  ) {
    const [newTeam, tutorial] = await this.getDocumentWithId(
      getIdOfDocumentRef(student.tutorial),
      teamId
    );

    if (this.isStudentMemberOfTeam(student, newTeam)) {
      return;
    }

    if (await student.getTeam()) {
      await this.removeStudentAsMemberFromTeam(student, { saveStudent: false });
    }

    newTeam.students.push(student);
    student.team = newTeam;

    if (saveStudent) {
      await Promise.all([tutorial.save(), student.save()]);
    } else {
      await tutorial.save();
    }
  }

  public async removeStudentAsMemberFromTeam(
    student: StudentDocument,
    { saveStudent }: { saveStudent?: boolean } = {}
  ) {
    const oldTeam = await student.getTeam();

    if (!oldTeam) {
      return;
    }

    const tutorial = isDocument(oldTeam.tutorial)
      ? oldTeam.tutorial
      : await tutorialService.getDocumentWithID(oldTeam.tutorial.toString());

    await studentService.movePointsFromTeamToStudent(student);

    oldTeam.students = oldTeam.students.filter(stud => getIdOfDocumentRef(stud) !== student.id);
    student.team = undefined;

    if (saveStudent) {
      await Promise.all([tutorial.save(), student.save()]);
    } else {
      await tutorial.save();
    }

    // TODO: Delete team if empty?! Maybe better UX: Add "delete all empty team"-Button to frontend. This will prevent "unintentional" deletions.
    // if (oldTeam.students.length === 0) {
    //   await this.deleteTeam(getIdOfDocumentRef(oldTeam.tutorial), oldTeam.id);
    // }
  }

  private isStudentMemberOfTeam(student: StudentDocument, team: TeamDocument): boolean {
    for (const doc of team.students) {
      if (getIdOfDocumentRef(doc) === student.id) {
        return true;
      }
    }

    return false;
  }

  private getFirstAvailableTeamNo(tutorial: TutorialDocument): number {
    for (let i = 1; i <= tutorial.teams.length; i++) {
      let isTeamNoInUse = false;

      for (const team of tutorial.teams) {
        if (team.teamNo === i) {
          isTeamNoInUse = true;
          break;
        }
      }

      if (!isTeamNoInUse) {
        return i;
      }
    }

    return tutorial.teams.length + 1;
  }

  private async getTeamOrReject(team: TeamDocument | null): Promise<Team> {
    if (!team) {
      return this.rejectTeamNotFound();
    }

    const { _id, teamNo, tutorial, students: studentDocs, points } = team;
    const studentPromises: Promise<Student>[] = [];

    for (const doc of studentDocs) {
      if (isDocument(doc)) {
        studentPromises.push(studentService.getStudentOrReject(doc));
      } else {
        studentPromises.push(studentService.getStudentWithId(doc.toString()));
      }
    }

    const students = await Promise.all(studentPromises);

    return {
      id: _id,
      teamNo,
      tutorial: getIdOfDocumentRef(tutorial),
      students,
      points,
    };
  }

  private async rejectTeamNotFound(): Promise<any> {
    return Promise.reject(new DocumentNotFoundError('Team with that ID was not found.'));
  }
}

const teamService = new TeamService();

export default teamService;
