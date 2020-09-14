import { BadRequestException, Injectable } from '@nestjs/common';
import { SubExerciseDocument } from '../../database/models/exercise.model';
import { ExerciseGradingDocument, GradingDocument } from '../../database/models/grading.model';
import { HasExercisesDocument } from '../../database/models/ratedEntity.model';
import { SheetDocument } from '../../database/models/sheet.model';
import { TeamDocument, TeamModel } from '../../database/models/team.model';
import { convertExercisePointInfoToString, ExercisePointsInfo } from '../../shared/model/Gradings';
import { ITeamMarkdownData } from '../../shared/model/Markdown';
import { ITeamId } from '../../shared/model/Team';
import { getNameOfEntity } from '../../shared/util/helpers';
import { ScheinexamService } from '../scheinexam/scheinexam.service';
import { SheetService } from '../sheet/sheet.service';
import { ShortTestService } from '../short-test/short-test.service';
import { StudentService } from '../student/student.service';
import { TeamService } from '../team/team.service';

export interface GenerateTeamGradingParams {
  teamId: ITeamId;
  sheetId: string;
}

export interface GenerateAllTeamsGradingParams {
  tutorialId: string;
  sheetId: string;
}

export interface TeamMarkdownData extends ITeamMarkdownData {
  invalid?: boolean;
}

interface TeamGradings {
  sheetNo: string;
  markdownData: TeamMarkdownData[];
}

export interface SingleTeamGradings extends TeamGradings {
  teamName: string;
}

interface SheetPointInfo {
  achieved: number;
  total: { must: number; bonus: number };
}

interface GeneratingParams {
  entity: HasExercisesDocument;
  grading: GradingDocument;
  nameOfEntity: string;
}

interface GenerateFromTeamParams {
  team: TeamDocument;
  sheet: SheetDocument;
  ignoreInvalidTeams: boolean;
}

interface GenerateSubExTableParams {
  subexercises: SubExerciseDocument[];
  gradingForExercise: ExerciseGradingDocument;
}

interface SubExData {
  name: string;
  achieved: number;
  total: ExercisePointsInfo;
}

@Injectable()
export class MarkdownService {
  constructor(
    private readonly teamService: TeamService,
    private readonly studentService: StudentService,
    private readonly sheetService: SheetService,
    private readonly scheinexamService: ScheinexamService,
    private readonly shortTestService: ShortTestService
  ) {}

  /**
   * Generates a list of markdown strings for each team's grading for the given sheet.
   *
   * The sheet number is also returned as a string for convenience.
   *
   * The returned gradings only include gradings for teams which:
   * - Have at least one student.
   * - Have a grading for the given sheet.
   *
   * All other teams are ignored.
   *
   * @param params Must contain the ID of the tutorial and the sheet to generate the gradings for.
   *
   * @returns Gradings for all the teams in the tutorial as markdown and the `sheetNo`.
   *
   * @throws `NotFoundException` - If either no tutorial with the given ID or no sheet with the given ID could be found.
   */
  async getAllTeamsGradings({
    tutorialId,
    sheetId,
  }: GenerateAllTeamsGradingParams): Promise<TeamGradings> {
    const teams = await this.teamService.findAllTeamsInTutorial(tutorialId);
    const sheet = await this.sheetService.findById(sheetId);

    const gradingsMD: TeamMarkdownData[] = [];

    teams.forEach((team) => {
      gradingsMD.push(...this.generateFromTeam({ team, sheet, ignoreInvalidTeams: true }));
    });

    return {
      markdownData: gradingsMD.filter((grad) => !grad.invalid),
      sheetNo: sheet.sheetNoAsString,
    };
  }

  /**
   * Generates a list with markdown for the grading of the given team for the given sheet.
   *
   * @param teamId TeamID of the team to get markdown for.
   * @param sheetId ID of the sheet.
   *
   * @returns List of generated markdown.
   *
   * @throws `NotFoundException` - If either no team with the given ID or no sheet with the given ID could be found.
   * @throws `BadRequestException` - If the given team does not have any students or the students do not hold a grading for the given sheet.
   */
  async getTeamGrading({
    teamId,
    sheetId,
  }: GenerateTeamGradingParams): Promise<SingleTeamGradings> {
    const team = await this.teamService.findById(teamId);
    const sheet = await this.sheetService.findById(sheetId);

    const markdownForTeam = this.generateFromTeam({ team, sheet, ignoreInvalidTeams: false });
    const markdownData = markdownForTeam.reduce<ITeamMarkdownData[]>((list, data) => {
      list.push({
        markdown: data.markdown,
        teamName: data.teamName,
        belongsToTeam: data.belongsToTeam,
      });

      return list;
    }, []);

    return {
      markdownData: markdownData,
      sheetNo: sheet.sheetNoAsString,
      teamName: team.getTeamName(),
    };
  }

  /**
   * Generates a markdown string for the grading of the given student for the given sheet.
   *
   * @param studentId ID of the student.
   * @param sheetId ID of the sheet.
   *
   * @returns Generated markdown.
   *
   * @throws `NotFoundException` - If either no student with the given ID or no sheet with the given ID could be found.
   * @throws `BadRequestException` - If the student does not hold a grading for the given sheet.
   */
  async getStudentGrading(studentId: string, sheetId: string): Promise<string> {
    const student = await this.studentService.findById(studentId);
    const entity = await this.getExercisesEntityWithId(sheetId);
    const grading = student.getGrading(entity);

    if (!grading) {
      throw new BadRequestException(
        `There is no grading available of the given entity and the given student.`
      );
    }

    return this.generateFromGrading({
      entity,
      grading,
      nameOfEntity: getNameOfEntity(student),
    });
  }

  /**
   * Generates the markdown for the team for the given sheet.
   *
   * If `ignoreInvalidTeams` is true, than no exceptions are thrown but a data entry is returned which has it's `invalid` field set to true.
   *
   * @param params Options for the markdown generation
   *
   * @returns List with MarkdownData for the team of the grading for the given sheet. Can be marked as `invalid` (see above).
   *
   * @throws `BadRequestException` - If `ignoreInvalidTeams` is false AND either the team has no students or the team has no gradings for the given sheet.
   */
  private generateFromTeam({
    team,
    sheet,
    ignoreInvalidTeams,
  }: GenerateFromTeamParams): TeamMarkdownData[] {
    try {
      if (team.students.length === 0) {
        throw new BadRequestException(`Can not generate markdown for an empty team.`);
      }

      const gradings = team.getGradings(sheet);
      const markdownData: TeamMarkdownData[] = [];

      if (gradings.length === 0) {
        throw new BadRequestException(
          `There is no grading available of the given sheet for the students in the given team.`
        );
      }

      gradings.forEach((grading) => {
        const studentsOfTeam = team.students.filter((stud) => grading.students.includes(stud.id));
        const teamName = TeamModel.generateTeamname(studentsOfTeam);
        const nameOfEntity = grading.belongsToTeam ? `Team ${teamName}` : `Student/in ${teamName}`;

        markdownData.push({
          teamName,
          markdown: this.generateFromGrading({ entity: sheet, grading, nameOfEntity }),
          belongsToTeam: grading.belongsToTeam,
        });
      });

      return markdownData.sort((a) => (a.belongsToTeam ? -1 : 1));
    } catch (err) {
      if (ignoreInvalidTeams) {
        return [{ markdown: '', teamName: '', invalid: true, belongsToTeam: false }];
      } else {
        throw err;
      }
    }
  }

  private generateFromGrading({ entity, grading, nameOfEntity }: GeneratingParams): string {
    const pointInfo: SheetPointInfo = { achieved: 0, total: { must: 0, bonus: 0 } };
    let exerciseMarkdown: string = '';

    entity.exercises.forEach((exercise) => {
      const gradingForExercise = grading.getExerciseGrading(exercise);

      if (!gradingForExercise) {
        return;
      }

      const { pointInfo: total, subexercises } = exercise;
      const achieved = gradingForExercise.points;
      const exMaxPoints = convertExercisePointInfoToString(total);
      const subExTable = this.generateSubExerciseTable({ subexercises, gradingForExercise });

      pointInfo.achieved += achieved;
      pointInfo.total.must = total.must;
      pointInfo.total.bonus = total.bonus;

      exerciseMarkdown += `## Aufgabe ${exercise.exName} [${achieved} / ${exMaxPoints}]\n\n`;
      if (!!subExTable) {
        exerciseMarkdown += `${subExTable}\n\n`;
      }
      exerciseMarkdown += `${gradingForExercise.comment ?? ''}\n\n`;
    });

    const totalPointInfo = convertExercisePointInfoToString(pointInfo.total);
    const header = `# ${nameOfEntity}\n\n**Gesamt: ${pointInfo.achieved} / ${totalPointInfo}**`;

    return `${header}\n\n${exerciseMarkdown}`;
  }

  private generateSubExerciseTable(params: GenerateSubExTableParams): string {
    const subExData: SubExData[] = this.generateSubExerciseData(params);

    if (subExData.length === 0) {
      return '';
    }

    let subExTable = '';

    subExData.forEach(({ name }) => {
      subExTable += `|${name}`;
    });
    subExTable += '|\n';

    subExData.forEach(() => {
      subExTable += '|:-----:';
    });
    subExTable += '|\n';

    subExData.forEach(({ achieved, total }) => {
      const totalString = convertExercisePointInfoToString(total);
      subExTable += `|${achieved} / ${totalString}`;
    });
    subExTable += '|\n';

    return subExTable;
  }

  private generateSubExerciseData({
    subexercises,
    gradingForExercise,
  }: GenerateSubExTableParams): SubExData[] {
    return subexercises.reduce<SubExData[]>((data, subEx) => {
      const achieved = gradingForExercise.getGradingForSubexercise(subEx);

      data.push({
        name: subEx.exName,
        achieved: achieved ?? 0,
        total: subEx.pointInfo,
      });

      return data;
    }, []);
  }

  /**
   * Tries to find a sheet, scheinexam or short test with the given ID.
   *
   * If one could be found that one is returned. If not an error is thrown.
   *
   * @param id ID of the entity.
   *
   * @returns Entity with the given ID.
   *
   * @throws `BadRequestException` - If there is no sheet, scheinexam or short test with the given ID.
   */
  private async getExercisesEntityWithId(id: string): Promise<HasExercisesDocument> {
    const [sheet, scheinexam, shortTest] = await Promise.allSettled([
      this.sheetService.findById(id),
      this.scheinexamService.findById(id),
      this.shortTestService.findById(id),
    ]);

    if (sheet.status === 'fulfilled') {
      return sheet.value;
    }

    if (scheinexam.status === 'fulfilled') {
      return scheinexam.value;
    }

    if (shortTest.status === 'fulfilled') {
      return shortTest.value;
    }

    throw new BadRequestException(
      `Could not find a sheet, scheinexam or short test with the given ID ('${id}')`
    );
  }
}
