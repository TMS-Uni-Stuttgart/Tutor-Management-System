import { Injectable } from '@nestjs/common';
import { getNameOfEntity } from '../../../shared/util/helpers';
import { UserService } from '../../user/user.service';
import { PDFGenerator } from './PDFGenerator.core';

@Injectable()
export class CredentialsPDFGenerator extends PDFGenerator {
  constructor(private readonly userService: UserService) {
    super('credentials.html');
  }

  /**
   * Generates a PDF containing a list with all the given users and their temporary passwords.
   *
   * @returns Buffer containing the PDF with the temporary passwords of the given users.
   */
  public async generatePDF(): Promise<Buffer> {
    const users = await this.userService.findAll();
    const tableRows: string[] = users.map((user) => {
      const tempPwd = user.temporaryPassword || 'NO TMP PASSWORD';
      const nameOfUser = getNameOfEntity(user);

      return `<tr><td>${nameOfUser}</td><td>${user.username}</td><td>${tempPwd}</td></tr>`;
    });

    const body = this.replacePlaceholdersInTemplate(tableRows);
    return this.generatePDFFromBody(body);
  }

  /**
   * Prepares the HTML template to contain the actual credentials inplace of the `{{credentials}}`.
   *
   * @param tableRows Table rows which get placed in the placeholder `{{credentials}}`.
   *
   * @returns Prepared template with the corresponding information.
   */
  private replacePlaceholdersInTemplate(tableRows: string[]): string {
    const template = this.getTemplate();

    return template.replace(/{{credentials}}/g, tableRows.join(''));
  }
}
