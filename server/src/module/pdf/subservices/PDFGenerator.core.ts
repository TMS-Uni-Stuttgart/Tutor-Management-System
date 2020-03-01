import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { BadRequestException, Logger } from '@nestjs/common';
import GITHUB_MARKDOWN_CSS from './css/githubMarkdown';

/**
 * @param T Type of the options passed to `generatePDF`.
 */
export abstract class PDFGenerator<T> {
  private readonly filename: string;

  protected constructor(filename: string) {
    this.filename = filename;
    this.checkIfTemplateFileExists();
  }

  /**
   * Generats a PDF from the given options.
   *
   * @param options Options from which the PDF gets generated.
   *
   * @returns Generated PDF as Buffer.
   */
  public abstract async generatePDF(options: T): Promise<Buffer>;

  /**
   * Loads and returns the given HTML template file. The returned string does NOT contain any comments anymore and additional spaces after `{{` and before `}}` were removed aswell.
   *
   * @param filename Filename of the corresponding template file.
   *
   * @returns Cleaned up HTML template file.
   * @throws `BadRequestError`: If the given html file could not be found.
   */
  protected getTemplate(): string {
    try {
      const filePath = path.join(process.cwd(), 'config', 'html', this.filename);
      const template = fs.readFileSync(filePath).toString();

      return this.prepareTemplate(template);
    } catch {
      throw new BadRequestException(
        `No template file present for filename '${this.filename}' in ./config/html folder`
      );
    }
  }

  /**
   * Generates a PDF from the given body. The body gets put in a HTML wrapper first.
   *
   * @param body Body content to be put in the PDF as HTML body.
   *
   * @returns Buffer containing the generated PDF.
   */
  protected async generatePDFFromBody(body: string): Promise<Buffer> {
    const html = this.putBodyInHTML(body);

    let browser: puppeteer.Browser | undefined;

    Logger.debug('Starting browser...');
    Logger.debug(`\tExec path: ${process.env.TMS_PUPPETEER_EXEC_PATH}`);

    try {
      browser = await puppeteer.launch({
        args: ['--disable-dev-shm-usage'],
        executablePath: process.env.TMS_PUPPETEER_EXEC_PATH,
      });

      Logger.debug('Browser startet.');

      const page = await browser.newPage();
      Logger.debug('Page created.');

      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      Logger.debug('Page content loaded');

      const buffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '1cm',
          right: '1cm',
          bottom: '1cm',
          left: '1cm',
        },
      });

      Logger.debug('PDF created.');

      await browser.close();

      Logger.debug('Browser closed');

      return buffer;
    } catch (err) {
      if (browser) {
        browser.close();
      }

      Logger.error(JSON.stringify(err, null, 2));

      throw err;
    }
  }

  /**
   * Puts the given body in corresponding a `<body>` element. The returned string is a complete HTML "file" with slightly customized GitHub Markdown CSS.
   *
   * @param body Body to embed in HTML.
   *
   * @returns Complete HTML "file" which contains the given `body` as body.
   */
  private putBodyInHTML(body: string): string {
    return `<html><head><style>${this.getGithubMarkdownCSS()}</style><style>${this.getCustomCSS()}</style></head><body class="markdown-body">${body}</body></html>`;
  }

  /**
   * Checks if the template file associated with this class exists. If it does NOT exist an error gets thrown else nothing happens.
   *
   * @throws `BadRequestError`: If the HTML template file could not be loaded.
   */
  private checkIfTemplateFileExists() {
    this.getTemplate();
  }

  /**
   * Prepares the given html template string to be used in further operations.
   *
   * This operations removes all HTML comments as well as spaced after `{{` and before `}}`.
   *
   * @param template Template string to adjust
   *
   * @returns Cleaned up HTML template file.
   */
  private prepareTemplate(template: string): string {
    return template
      .replace(/{{\s+/g, '{{')
      .replace(/\s+}}/g, '}}')
      .replace(/(?=<!--)([\s\S]*?)-->/gim, '');
  }

  /**
   * @returns The GitHub markdown CSS.
   */
  private getGithubMarkdownCSS(): string {
    return GITHUB_MARKDOWN_CSS;
  }

  /**
   * @returns Some small customizations to the GitHub markdown CSS.
   */
  private getCustomCSS(): string {
    return '.markdown-body table { display: table; width: 100%; }';
  }
}
