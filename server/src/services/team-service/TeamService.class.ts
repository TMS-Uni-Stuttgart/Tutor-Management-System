import _ from 'lodash';
import {
  PointMap,
  UpdatePointsDTO,
  PointMapEntry,
  PointId,
  getPointsOfExercise,
  ExercisePointInfo,
} from 'shared/dist/model/Points';
import { Student } from 'shared/dist/model/Student';
import { Team, TeamDTO } from 'shared/dist/model/Team';
import { isDocument } from '@typegoose/typegoose';
import { getIdOfDocumentRef } from '../../helpers/documentHelpers';
import { TypegooseDocument } from '../../helpers/typings';
import { StudentDocument } from '../../model/documents/StudentDocument';
import { TeamDocument, TeamSchema } from '../../model/documents/TeamDocument';
import { TutorialDocument } from '../../model/documents/TutorialDocument';
import { DocumentNotFoundError, BadRequestError } from '../../model/Errors';
import sheetService from '../sheet-service/SheetService.class';
import studentService from '../student-service/StudentService.class';
import tutorialService from '../tutorial-service/TutorialService.class';
import Logger from '../../helpers/Logger';

type SubExPointInformation = Omit<PointInformation, 'entry'>;

export interface PointInformation {
  id: string;
  exName: string;
  exPoints: ExercisePointInfo;
  entry: PointMapEntry;
  subexercises: SubExPointInformation[];
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
    await this.saveTutorialWithChangedTeams(tutorial);

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
    const [team] = await this.getDocumentWithId(tutorialId, teamId);
    const studentsOfTeam = await this.getStudentsOfTeam(team);

    const studentsToRemove: StudentDocument[] = await Promise.all(
      _.difference(studentsOfTeam.map(getIdOfDocumentRef), students).map(stud =>
        studentService.getDocumentWithId(stud)
      )
    );
    const studentsToAdd: StudentDocument[] = await Promise.all(
      _.difference(students, studentsOfTeam.map(getIdOfDocumentRef)).map(stud =>
        studentService.getDocumentWithId(stud)
      )
    );

    for (const student of studentsToRemove) {
      await this.removeStudentAsMemberFromTeam(student, { saveStudent: true });
    }

    for (const student of studentsToAdd) {
      await this.makeStudentMemberOfTeam(student, team.id, { saveStudent: true });
    }

    const [updatedTeam] = await this.getDocumentWithId(tutorialId, team.id);

    return this.getTeamOrReject(updatedTeam);
  }

  public async deleteTeam(tutorialId: string, teamId: string) {
    const [team, tutorial] = await this.getDocumentWithId(tutorialId, teamId);
    const studentsOfTeam = await this.getStudentsOfTeam(team);

    for (const student of studentsOfTeam) {
      await this.removeStudentAsMemberFromTeam(student, { saveStudent: true });
    }

    tutorial.teams.pull({ _id: team.id });

    await this.saveTutorialWithChangedTeams(tutorial);
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

    await this.saveTutorialWithChangedTeams(tutorial);
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
    const sheet = await sheetService.getDocumentWithId(sheetId);

    const pointMap = new PointMap(team.points);
    const entries: PointInformation[] = [];

    sheet.exercises.forEach(ex => {
      const entry = pointMap.getPointEntry(new PointId(sheetId, ex));
      const subexercises: SubExPointInformation[] = [];

      ex.subexercises.forEach(subex => {
        subexercises.push({
          id: subex.id,
          exName: subex.exName,
          exPoints: getPointsOfExercise(subex),
          subexercises: [],
        });
      });

      if (entry) {
        entries.push({
          id: ex.id,
          exName: ex.exName,
          entry,
          exPoints: getPointsOfExercise(ex),
          subexercises,
        });
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
    const [newTeamToCheck] = await this.getDocumentWithId(
      getIdOfDocumentRef(student.tutorial),
      teamId
    );

    if (this.isStudentMemberOfTeam(student, newTeamToCheck)) {
      return;
    }

    if (await student.getTeam()) {
      await this.removeStudentAsMemberFromTeam(student, { saveStudent: false });
    }

    // Get the new team bc the team (and the tutorial) could have changed until now.
    const [newTeam, tutorial] = await this.getDocumentWithId(
      getIdOfDocumentRef(student.tutorial),
      teamId
    );

    student.team = newTeam;
    newTeam.students.push(student);

    if (saveStudent) {
      await student.save();
    }

    await this.saveTutorialWithChangedTeams(tutorial);
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
    const studentsOfOldTeam = await this.getStudentsOfTeam(oldTeam);

    oldTeam.students = studentsOfOldTeam.filter(stud => getIdOfDocumentRef(stud) !== student.id);
    student.team = undefined;

    const idx = tutorial.teams.findIndex(team => team.id === oldTeam.id);
    tutorial.teams.set(idx, oldTeam);

    if (saveStudent) {
      await student.save();
    }

    await this.saveTutorialWithChangedTeams(tutorial);
  }

  /**
   * Returns all existing documents of students in the given team.
   *
   * Retrieves all `StudentDocuments` from all students of the given team. If a `StudentDocument` does not exist (anymore) it will be removed from the given team. Afterwards them given team's tutorial will be updated accordingly. All of this is done if necessary before the documents are finally returned.
   *
   * @returns `StudentDocuments` of all students which still exist in the DB.
   */
  public async getStudentsOfTeam(team: TeamDocument): Promise<StudentDocument[]> {
    const studentDocs: StudentDocument[] = [];
    const studentsToRemove: string[] = [];

    for (const student of team.students) {
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
      team.students = team.students.filter(s => !studentsToRemove.includes(getIdOfDocumentRef(s)));

      const tutorial = isDocument(team.tutorial)
        ? team.tutorial
        : await tutorialService.getDocumentWithID(team.tutorial.toString());
      const idx = tutorial.teams.findIndex(t => t.id === team.id);

      tutorial.teams.set(idx, team);
      tutorial.save();
    }

    return studentDocs;
  }

  /**
   * Checks if the given student is a member of the given team.
   *
   * @param student Student to check.
   * @returns Is student a member of the given team?
   */
  private isStudentMemberOfTeam(student: StudentDocument, team: TeamDocument): boolean {
    for (const s of team.students) {
      if (getIdOfDocumentRef(s) === student.id) {
        return true;
      }
    }

    return false;
  }

  private async saveTutorialWithChangedTeams(
    tutorial: TutorialDocument
  ): Promise<TutorialDocument> {
    // Mongoose is not able to detect the change so we tell it that the teams array has changed...
    // See: https://mongoosejs.com/docs/schematypes.html#mixed
    tutorial.markModified('teams');
    return tutorial.save();
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

  public async getTeamOrReject(team: TeamDocument | null): Promise<Team> {
    if (!team) {
      return this.rejectTeamNotFound();
    }

    const { id, teamNo, tutorial, points } = team;
    const studentPromises: Promise<Student>[] = [];
    const studentDocs = await this.getStudentsOfTeam(team);

    for (const doc of studentDocs) {
      studentPromises.push(studentService.getStudentOrReject(doc));
    }

    const students = await Promise.all(studentPromises);

    return {
      id,
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
