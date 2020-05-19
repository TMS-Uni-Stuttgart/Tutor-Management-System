import { Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';
import GITHUB_MARKDOWN_CSS from './css/githubMarkdown';

/**
 * @param T Type of the options passed to `generatePDF`.
 */
export abstract class PDFGenerator<T = {}> {
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
    const html = this.putBodyInHTML(body);
    let browser: puppeteer.Browser | undefined;

    Logger.debug('Starting browser...');
    Logger.debug(`\tExec path: ${process.env.TMS_PUPPETEER_EXEC_PATH}`);

    try {
      browser = await puppeteer.launch({
        args: ['--disable-dev-shm-usage'],
        executablePath: process.env.TMS_PUPPETEER_EXEC_PATH,
      });

      Logger.debug('Browser started.');

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
