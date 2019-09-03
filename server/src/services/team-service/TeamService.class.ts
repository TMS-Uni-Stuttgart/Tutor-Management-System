import _ from 'lodash';
import { Student } from 'shared/dist/model/Student';
import { Team, TeamDTO } from 'shared/dist/model/Team';
import { Typegoose } from 'typegoose';
import { isDocument } from 'typegoose/lib/utils';
import { getIdOfDocumentRef } from '../../helpers/documentHelpers';
import { StudentDocument } from '../../model/documents/StudentDocument';
import { TeamDocument, TeamSchema } from '../../model/documents/TeamDocument';
import { TutorialDocument } from '../../model/documents/TutorialDocument';
import { DocumentNotFoundError } from '../../model/Errors';
import studentService from '../student-service/StudentService.class';
import tutorialService from '../tutorial-service/TutorialService.class';
import { Types } from 'mongoose';

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

  public async createTeam(
    tutorialId: string,
    { teamNo, students: studentIds }: TeamDTO
  ): Promise<Team> {
    const tutorial = await tutorialService.getDocumentWithID(tutorialId);
    const students: StudentDocument[] = await Promise.all(
      studentIds.map(stud => studentService.getDocumentWithId(stud))
    );

    const team: Omit<TeamSchema, keyof Typegoose> = {
      tutorial,
      students,
      points: {},
      teamNo,
    };
    tutorial.teams.push(team);

    await tutorial.save();

    const createdTeam = tutorial.teams[tutorial.teams.length - 1];

    for (const student of students) {
      await this.makeStudentMemberOfTeam(student, createdTeam.id.toString(), {
        saveStudent: true,
      });
    }

    return this.getTeamOrReject(createdTeam);
  }

  public async updateTeam(
    tutorialId: string,
    teamId: string,
    { teamNo, students }: TeamDTO
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

    team.teamNo = teamNo;

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

    if (student.team) {
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
    if (!student.team) {
      return;
    }

    const [oldTeam, tutorial] = await this.getDocumentWithId(
      getIdOfDocumentRef(student.tutorial),
      getIdOfDocumentRef(student.team)
    );

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
