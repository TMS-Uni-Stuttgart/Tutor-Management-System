// noinspection HtmlRequiredLangAttribute,HtmlRequiredTitleElement

import { Logger } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { StaticSettings } from 'module/settings/settings.static';

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
    public abstract generatePDF(options: T): Promise<Buffer>;

    /**
     * Generates a PDF from the given body. The body gets put in an HTML wrapper first.
     *
     * @param body Body content to be put in the PDF as HTML body.
     *
     * @returns Buffer containing the generated PDF.
     */
    protected async generatePDFFromBodyContent(body: string): Promise<Buffer> {
        const html = await this.putBodyInHTML(body);
        const gotenbergConfig = StaticSettings.getService().getGotenbergConfiguration();

        try {
            const form = new FormData();
            form.append('files', html, { filename: 'index.html', contentType: 'text/html' });

            this.logger.debug('Sending request to Gotenberg for PDF generation...');

            const response = await axios.post(
                `http://${gotenbergConfig?.host}:${gotenbergConfig?.port}/forms/chromium/convert/html`,
                form,
                {
                    headers: {
                        ...form.getHeaders(),
                    },
                    timeout: gotenbergConfig?.timeout,
                    responseType: 'arraybuffer',
                }
            );

            this.logger.debug('PDF generated successfully from Gotenberg.');

            return Buffer.from(response.data);
        } catch (err) {
            this.logger.error('Failed to generate PDF:', err);
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
    <style>${PDFGenerator.getCustomCSS()}</style>
    </head>
    <body class='markdown-body'>${body}</body>
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
    private static getCustomCSS(): string {
        return '.markdown-body table { display: table; width: 100%; }';
    }
}
