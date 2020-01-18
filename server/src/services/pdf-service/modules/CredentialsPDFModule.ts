import { User } from 'shared/src/model/User';
import { PDFModule } from './PDFModule';
import { getNameOfEntity } from 'shared/src/util/helpers';

interface GeneratorOptions {
  users: User[];
}

export class CredentialsPDFModule extends PDFModule<GeneratorOptions> {
  constructor() {
    super('credentials.html');
  }

  /**
   * Generates a PDF containing a list with all the given users and their temporary passwords.
   *
   * @param options Must contain an array of users which credentials should be generated.
   *
   * @returns Buffer containing the PDF with the temporary passwords of the given users.
   */
  public generatePDF({ users }: GeneratorOptions): Promise<Buffer> {
    const tableRows: string[] = users.map(user => {
      const tempPwd = user.temporaryPassword || 'NO TMP PASSWORD';
      const nameOfUser = getNameOfEntity(user, { lastNameFirst: true });

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
