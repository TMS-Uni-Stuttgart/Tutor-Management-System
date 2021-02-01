import { IsNotEmpty, IsString } from 'class-validator';
import { SubExerciseDocument } from '../../database/models/exercise.model';
import { ExerciseGrading, Grading } from '../../database/models/grading.model';
import { HasExercisesDocument } from '../../database/models/ratedEntity.model';
import { SheetDocument } from '../../database/models/sheet.model';
import { TeamDocument } from '../../database/models/team.model';
import { ExercisePointsInfo } from '../../shared/model/Gradings';
import { IMarkdownToHTMLPayload, ITeamMarkdownData } from '../../shared/model/Markdown';
import { ITeamId } from '../../shared/model/Team';

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
    entity: HasExercisesDocument;
    grading: Grading;
    nameOfEntity: string;
}

export interface GenerateFromTeamParams {
    team: TeamDocument;
    sheet: SheetDocument;
    ignoreInvalidTeams: boolean;
}

export interface GenerateSubExTableParams {
    subexercises: SubExerciseDocument[];
    gradingForExercise: ExerciseGrading;
}

export interface SubExData {
    name: string;
    achieved: number;
    total: ExercisePointsInfo;
}
