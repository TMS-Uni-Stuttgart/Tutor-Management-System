import { IsNotEmpty, IsString } from 'class-validator';
import { ExercisePointsInfo } from 'shared/model/Gradings';
import { IMarkdownToHTMLPayload, ITeamMarkdownData } from 'shared/model/Markdown';
import { ITeamId } from 'shared/model/Team';
import { ExerciseGrading, Grading } from '../../database/entities/grading.entity';
import { HasExercises, SubExercise } from '../../database/entities/ratedEntity.entity';
import { Sheet } from '../../database/entities/sheet.entity';
import { Team } from '../../database/entities/team.entity';

export class MarkdownHTMLDTO implements IMarkdownToHTMLPayload {
    @IsString()
    @IsNotEmpty()
    markdown!: string;
}

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

export interface TeamGradings {
    sheetNo: string;
    markdownData: TeamMarkdownData[];
}

export interface SingleTeamGradings extends TeamGradings {
    teamName: string;
}

export interface SheetPointInfo {
    achieved: number;
    total: { must: number; bonus: number };
}

export interface GeneratingParams {
    entity: HasExercises;
    grading: Grading;
    nameOfEntity: string;
}

export interface GenerateFromTeamParams {
    team: Team;
    sheet: Sheet;
    ignoreInvalidTeams: boolean;
}

export interface GenerateSubExTableParams {
    subexercises: SubExercise[];
    gradingForExercise: ExerciseGrading;
}

export interface SubExData {
    name: string;
    achieved: number;
    total: ExercisePointsInfo;
}
