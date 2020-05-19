import { Injectable } from '@nestjs/common';
import { getNameOfEntity, sortByName } from '../../../shared/util/helpers';
import { TemplateService } from '../../template/template.service';
import { UserService } from '../../user/user.service';
import { PDFGenerator } from './PDFGenerator.core';

@Injectable()
export class CredentialsPDFGenerator extends PDFGenerator {
  constructor(
    private readonly userService: UserService,
    private readonly templateService: TemplateService
  ) {
    super();
  }

  /**
   * Generates a PDF containing a list with all the given users and their temporary passwords.
   *
   * @returns Buffer containing the PDF with the temporary passwords of the given users.
   */
  public async generatePDF(): Promise<Buffer> {
    const users = await this.userService.findAll();
    const template = this.templateService.getCredentialsTemplate();

    return this.generatePDFFromBodyContent(
      template({
        users: users.sort(sortByName).map((u) => ({
          name: getNameOfEntity(u),
          username: u.username,
          password: u.temporaryPassword,
        })),
      })
    );
  }
}
