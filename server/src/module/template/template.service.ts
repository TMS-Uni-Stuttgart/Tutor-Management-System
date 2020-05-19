import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import pug from 'pug';
import path from 'path';
import fs from 'fs';
import { SettingsService } from '../settings/settings.service';
import { StartUpException } from '../../exceptions/StartUpException';
import {
  Template,
  AttendanceAttributes,
  CredentialsAttributes,
  ScheinexamAttributes,
  ScheinstatusAttributes,
  MailAttribtutes,
} from './template.types';

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);
  private readonly TEMPLATE_FILES = {
    attendance: 'attendance.pug',
    credentials: 'credentials.pug',
    mail: 'mail.pug',
    scheinexam: 'scheinexam.pug',
    scheinstatus: 'scheinstatus.pug',
  };

  constructor(private readonly settings: SettingsService) {}

  getAttendanceTemplate(): Template<AttendanceAttributes> {
    return this.getTemplate(this.TEMPLATE_FILES.attendance);
  }

  getCredentialsTemplate(): Template<CredentialsAttributes> {
    return this.getTemplate(this.TEMPLATE_FILES.credentials);
  }

  getMailTemplate(): Template<MailAttribtutes> {
    return this.getTemplate(this.TEMPLATE_FILES.mail);
  }

  getScheinexamTemplate(): Template<ScheinexamAttributes> {
    return this.getTemplate(this.TEMPLATE_FILES.scheinexam);
  }

  getScheinstatusTemplate(): Template<ScheinstatusAttributes> {
    return this.getTemplate(this.TEMPLATE_FILES.scheinstatus);
  }

  checkAllTemplatesPresent() {
    const notExisting: string[] = [];

    for (const [, value] of Object.entries(this.TEMPLATE_FILES)) {
      const filePath = this.getPathToTemplateFile(value);
      try {
        fs.accessSync(filePath);

        this.logger.log(`Template file '${value}' found.`);
      } catch {
        notExisting.push(filePath);
      }
    }

    if (notExisting.length > 0) {
      throw new StartUpException(
        `The following template files could not be found: \n\t- ${notExisting.join('\n\t- ')}`
      );
    }
  }

  private getTemplate(file: string): pug.compileTemplate {
    const filePath = this.getPathToTemplateFile(file);

    this.assertFileExists(filePath);
    return pug.compileFile(filePath);
  }

  private getPathToTemplateFile(file: string): string {
    return path.join(this.settings.getConfigPath(), 'templates', file);
  }

  private assertFileExists(filePath: string) {
    try {
      fs.accessSync(filePath);
    } catch (err) {
      this.logger.error(`Could not find the template file at '${filePath}'`);
      throw new InternalServerErrorException(`Could not find the template file at '${filePath}'`);
    }
  }
}
