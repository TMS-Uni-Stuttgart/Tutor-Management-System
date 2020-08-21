import { Injectable } from '@nestjs/common';
import pug from 'pug';
import { SheetDocument } from '../../database/models/sheet.model';
import { ITeamId } from '../../shared/model/Team';
import { SettingsService } from '../settings/settings.service';
import { SheetService } from '../sheet/sheet.service';
import { TeamService } from '../team/team.service';
import { Template } from '../template/template.types';
import { TutorialService } from '../tutorial/tutorial.service';

export interface GenerateFilenameParams {
  sheetId: string;
  teamId: ITeamId;
}

export interface GenerateTutorialFilenameParams {
  sheetId: string;
  tutorialId: string;
}

type Extension = 'pdf' | 'zip';

interface FileNameParams {
  sheet: SheetDocument;
  teamName: string;
  extension?: Extension;
}

interface TutorialGradingFilenameParams {
  sheet: SheetDocument;
  tutorialSlot: string;
  extension?: Extension;
}

interface FilenameAttributes {
  sheetNo: string;
  teamName: string;
}

interface TutorialFilenameAttriutes {
  sheetNo: string;
  tutorialSlot: string;
}

@Injectable()
export class FileService {
  private gradingFilename: Template<FilenameAttributes> | undefined;
  private tutorialGradingFilename: Template<TutorialFilenameAttriutes> | undefined;

  constructor(
    private readonly sheetService: SheetService,
    private readonly teamService: TeamService,
    private readonly tutorialService: TutorialService,
    private readonly settingsService: SettingsService
  ) {}

  /**
   * Generates a grading filename without an extension.
   *
   * @param dto Params to generate the filename from.
   *
   * @returns Generated filename.
   */
  async generateGradingFilename(dto: GenerateFilenameParams): Promise<string> {
    const { sheetId, teamId } = dto;
    const sheet = await this.sheetService.findById(sheetId);
    const team = await this.teamService.findById(teamId);
    return this.getGradingFilename({ sheet, teamName: team.getTeamName() });
  }

  /**
   * Generates a filename for a grading zip file containing the gradings of all teams within a tutorial without an extension.
   *
   * @param dto Params to generate the filename from.
   *
   * @returns Generated filename.
   */
  async generateTutorialGradingFilename(dto: GenerateTutorialFilenameParams): Promise<string> {
    const { sheetId, tutorialId } = dto;
    const sheet = await this.sheetService.findById(sheetId);
    const tutorial = await this.tutorialService.findById(tutorialId);
    return this.getTutorialGradingFilename({
      sheet: sheet,
      tutorialSlot: tutorial.slot,
    });
  }

  /**
   * Creates a filename from the given sheet number and teamname.
   *
   * This function behaves like a sync function except the `this.filenameTemplate` property is not set yet. If it is set no internal async calls are made.
   *
   * @param sheet Sheet
   * @param teamName Name of the team.
   * @param extension Extension of the filename. Either 'pdf' or 'zip'. (__without__ leading '.').
   *
   * @returns Created filename.
   */
  async getGradingFilename({ sheet, teamName, extension }: FileNameParams): Promise<string> {
    await this.loadFilenameTemplates();

    const filename =
      this.gradingFilename?.({ sheetNo: sheet.sheetNoAsString, teamName }) ?? 'NO_FILE_NAME';

    return !!extension ? `${filename}.${extension}` : filename;
  }

  /**
   * Creates a filename for a file containing multiple gradings of a tutorial.
   *
   * @param sheet Sheet
   * @param tutorialSlot Slot of the tutorial.
   * @param extension Extension of the filename. Either 'pdf' or 'zip'. (__without__ leading '.').
   *
   * @returns Created filename.
   */
  private async getTutorialGradingFilename({
    sheet,
    tutorialSlot,
    extension,
  }: TutorialGradingFilenameParams): Promise<string> {
    await this.loadFilenameTemplates();

    const filename =
      this.tutorialGradingFilename?.({ sheetNo: sheet.sheetNoAsString, tutorialSlot }) ??
      'NO_FILE_NAME';

    return !!extension ? `${filename}.${extension}` : filename;
  }

  /**
   * Loads and compiles the template string for the gradings filename.
   *
   * Afterwards the `this.filenameTemplate` property is set to the compiled template.
   */
  private async loadFilenameTemplates(): Promise<void> {
    const {
      gradingFilename,
      tutorialGradingFilename,
    } = await this.settingsService.getClientSettings();

    this.gradingFilename = this.parseAndCompileFilenameTemplate(gradingFilename);
    this.tutorialGradingFilename = this.parseAndCompileFilenameTemplate(tutorialGradingFilename);
  }

  /**
   * Adds a leading '|' if necessary and returns the compile pug template.
   *
   * @param template Pug-template to adjust
   *
   * @returns Compiled pug-template.
   */
  private parseAndCompileFilenameTemplate<T>(template: string): Template<T> {
    let parsedTemplate: string;
    if (template.startsWith('|')) {
      parsedTemplate = template;
    } else {
      parsedTemplate = `|${template}`;
    }

    return pug.compile(parsedTemplate);
  }
}
