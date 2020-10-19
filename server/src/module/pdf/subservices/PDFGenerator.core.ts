import { Logger } from '@nestjs/common';
import fs from 'fs';
import puppeteer from 'puppeteer';

/**
 * @param T Type of the options passed to `generatePDF`.
 */
export abstract class PDFGenerator<T = Record<string, unknown>> {
  private readonly logger = new Logger(PDFGenerator.name);
  /**
   * Generates a PDF from the given options.
   *
   * @param options Options from which the PDF gets generated.
   *
   * @returns Generated PDF as Buffer.
   */
  public abstract async generatePDF(options: T): Promise<Buffer>;

  /**
   * Generates a PDF from the given body. The body gets put in a HTML wrapper first.
   *
   * @param body Body content to be put in the PDF as HTML body.
   *
   * @returns Buffer containing the generated PDF.
   */
  protected async generatePDFFromBodyContent(body: string): Promise<Buffer> {
    const html = await this.putBodyInHTML(body);
    let browser: puppeteer.Browser | undefined;

    this.logger.debug('Starting browser...');
    this.logger.debug(`\tExec path: ${process.env.TMS_PUPPETEER_EXEC_PATH}`);

    try {
      browser = await puppeteer.launch({
        args: ['--disable-dev-shm-usage'],
        executablePath: process.env.TMS_PUPPETEER_EXEC_PATH,
      });

      this.logger.debug('Browser started.');

      const page = await browser.newPage();
      this.logger.debug('Page created.');

      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      this.logger.debug('Page content loaded');

      const buffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '1cm',
          right: '1cm',
          bottom: '1cm',
          left: '1cm',
        },
        // Fixes CSS 'background' not being respected in printed PDFs.
        printBackground: true,
      });

      this.logger.debug('PDF created.');

      await browser.close();

      this.logger.debug('Browser closed');

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
  private async putBodyInHTML(body: string): Promise<string> {
    const githubCSS = await this.getGithubMarkdownCSS();
    const highlightCSS = await this.getHighlightCSS();

    return `
    <html>
    <head>
    <style>${githubCSS}</style>
    <style>${highlightCSS}</style>
    <style>${this.getCustomCSS()}</style>
    </head>
    <body class="markdown-body">${body}</body>
    </html>
    `;
  }

  /**
   * @returns The GitHub markdown CSS.
   */
  private async getGithubMarkdownCSS(): Promise<string> {
    return this.loadCSSFile('github-markdown-css/github-markdown.css');
  }

  /**
   * @returns The HighlightJS CSS.
   */
  private async getHighlightCSS(): Promise<string> {
    return this.loadCSSFile('highlight.js/styles/googlecode.css');
  }

  private async loadCSSFile(moduleName: string): Promise<string> {
    try {
      const pathToFile = require.resolve(moduleName);
      const css = fs.readFileSync(pathToFile);

      return css.toString();
    } catch (err) {
      this.logger.error(`Could not load CSS file '${moduleName}'`);
      return '';
    }
  }

  /**
   * @returns Some small customizations to the GitHub markdown CSS.
   */
  private getCustomCSS(): string {
    return '.markdown-body table { display: table; width: 100%; }';
  }
}
