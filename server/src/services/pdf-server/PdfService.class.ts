import pdf from 'html-pdf';
import { BadRequestError } from '../../model/Errors';
import fs, { ReadStream } from 'fs';
import path from 'path';

class PdfService {
  private githubMarkdownCSS: string = '';

  public async generateAttendancePDF(tutorialId: string): Promise<ReadStream> {
    return new Promise((resolve, reject) => {
      const body = '<h1>Header</h1><div>Testtext</div>';
      const html = `<html><head><style>${this.getGithubMarkdownCSS()}</style></head><body class='markdown-body'>${body}</body></html>`;

      pdf
        .create(html, {
          format: 'A4', // allowed units: A3, A4, A5, Legal, Letter, Tabloid
          orientation: 'portrait', // portrait or landscape
          border: '1cm',
        })
        .toStream((err, stream) => {
          if (err) {
            reject(new BadRequestError(String(err)));
          } else {
            resolve(stream);
          }
        });
    });
  }

  private getGithubMarkdownCSS(): string {
    if (!this.githubMarkdownCSS) {
      this.githubMarkdownCSS = fs
        .readFileSync(path.join(__dirname, 'css', 'githubMarkdown.css'))
        .toString();
    }

    return this.githubMarkdownCSS;
  }
}

const pdfService = new PdfService();

export default pdfService;
