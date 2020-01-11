import {
  convertExercisePointInfoToString,
  ExercisePointInfo,
  PointMap,
} from 'shared/src/model/Points';
import { TeamDocument } from '../../model/documents/TeamDocument';
import teamService, { PointInformation } from '../team-service/TeamService.class';

export interface TeamCommentData {
  teamName: string;
  markdown: string;
}

export interface SheetPointInfo {
  achieved: number;
  total: { must: number; bonus: number };
}

class MarkdownService {
  public async generateMarkdownFromTeamComment({
    team,
    tutorialId,
    sheetId,
  }: {
    team: TeamDocument;
    tutorialId: string;
    sheetId: string;
  }): Promise<TeamCommentData> {
    const entries = await teamService.getPoints(tutorialId, team.id, sheetId);
    const students = await teamService.getStudentsOfTeam(team);
    const teamName = students.map(s => s.lastname).join('');

    return { teamName, markdown: this.generateMarkdownFromPointEntries(entries, teamName) };
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
