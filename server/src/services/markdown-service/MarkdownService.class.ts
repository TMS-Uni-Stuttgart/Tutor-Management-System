import {
  convertExercisePointInfoToString,
  ExercisePointInfo,
  PointMap,
  PointId,
  PointMapEntry,
  getPointsOfExercise,
} from 'shared/src/model/Points';
import { TeamDocument } from '../../model/documents/TeamDocument';
import teamService from '../team-service/TeamService.class';
import { HasExercises } from 'shared/src/model/Sheet';
import sheetService from '../sheet-service/SheetService.class';
import { StudentDocument } from '../../model/documents/StudentDocument';
import { getNameOfEntity } from 'shared/src/util/helpers';
import studentService from '../student-service/StudentService.class';

export interface PointInformation {
  id: string;
  exName: string;
  exPoints: ExercisePointInfo;
  entry: PointMapEntry;
  subexercises: SubExPointInformation[];
}

export type SubExPointInformation = Omit<PointInformation, 'entry'>;

export interface TeamCommentData {
  teamName: string;
  markdown: string;
}

export interface SheetPointInfo {
  achieved: number;
  total: { must: number; bonus: number };
}

class MarkdownService {
  public async getMarkdownFromTeamComment(
    tutorialId: string,
    teamId: string,
    sheetId: string
  ): Promise<string> {
    const [team] = await teamService.getDocumentWithId(tutorialId, teamId);

    const { markdown } = await this.generateMarkdownFromTeamComment({
      team,
      sheetId,
    });

    return markdown;
  }

  public async getMarkdownFromStudentComment(studentId: string, sheetId: string): Promise<string> {
    const student = await studentService.getDocumentWithId(studentId);

    return this.generateMarkdownFromStudentComment({ student, sheetId });
  }

  public async generateMarkdownFromTeamComment({
    team,
    sheetId,
  }: {
    team: TeamDocument;
    sheetId: string;
  }): Promise<TeamCommentData> {
    const sheet = await sheetService.getSheetWithId(sheetId);
    const students = await teamService.getStudentsOfTeam(team);
    const teamName = students.map(s => s.lastname).join('');

    const entries = await this.getPointInformation(new PointMap(team.points), sheet);

    return { teamName, markdown: this.generateMarkdownFromPointEntries(entries, teamName) };
  }

  private async generateMarkdownFromStudentComment({
    student,
    sheetId,
  }: {
    student: StudentDocument;
    sheetId: string;
  }): Promise<string> {
    const sheet = await sheetService.getSheetWithId(sheetId);
    const points = await student.getPoints();
    const entries = await this.getPointInformation(points, sheet);

    const studentName = getNameOfEntity(student);

    return this.generateMarkdownFromPointEntries(entries, studentName);
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
  public async getPointInformation(
    pointMap: PointMap,
    sheet: HasExercises
  ): Promise<PointInformation[]> {
    const entries: PointInformation[] = [];

    sheet.exercises.forEach(ex => {
      const entry = pointMap.getPointEntry(new PointId(sheet.id, ex));
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

  private generateMarkdownFromPointEntries(
    entries: PointInformation[],
    nameOfEntity: string
  ): string {
    const pointInfo: SheetPointInfo = { achieved: 0, total: { must: 0, bonus: 0 } };
    let exerciseMarkdown: string = '';

    entries.forEach(({ exName, entry, exPoints, subexercises }) => {
      const achievedPts = PointMap.getPointsOfEntry(entry);
      const exMaxPoints: string = convertExercisePointInfoToString(exPoints);

      pointInfo.achieved += achievedPts;
      pointInfo.total.must += exPoints.must;
      pointInfo.total.bonus += exPoints.bonus;

      exerciseMarkdown += `## Aufgabe ${exName} [${achievedPts} / ${exMaxPoints}]\n\n`;

      if (typeof entry.points === 'object' && subexercises.length > 0) {
        const subExData: { name: string; achieved: number; total: ExercisePointInfo }[] = [];

        for (const subEx of subexercises) {
          const achievedPts = entry.points[subEx.id];
          subExData.push({
            name: subEx.exName,
            achieved: achievedPts || 0,
            total: subEx.exPoints,
          });
        }

        let subexerciseMarkdown = '';

        subExData.forEach(({ name }) => {
          subexerciseMarkdown += `|${name}`;
        });
        subexerciseMarkdown += '|\n';

        subExData.forEach(() => {
          subexerciseMarkdown += '|:-----:';
        });
        subexerciseMarkdown += '|\n';

        subExData.forEach(({ achieved, total }) => {
          const totalString = convertExercisePointInfoToString(total);
          subexerciseMarkdown += `|${achieved} / ${totalString}`;
        });
        subexerciseMarkdown += '|\n';

        exerciseMarkdown += `${subexerciseMarkdown}\n\n`;
      }

      exerciseMarkdown += `${entry.comment}\n\n`;
    });

    const totalPointInfo = convertExercisePointInfoToString(pointInfo.total);
    const markdown = `# ${nameOfEntity}\n\n**Gesamt: ${pointInfo.achieved} / ${totalPointInfo}**\n\n${exerciseMarkdown}`;

    return markdown;
  }
}

const markdownService = new MarkdownService();

export default markdownService;
