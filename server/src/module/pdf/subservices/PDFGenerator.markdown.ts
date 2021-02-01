import { Injectable } from '@nestjs/common';
import { MarkdownService } from '../../markdown/markdown.service';
import { PDFGenerator } from './PDFGenerator.core';

interface GeneratorOptions {
    markdown: string;
}

@Injectable()
export class MarkdownPDFGenerator extends PDFGenerator<GeneratorOptions> {
    constructor(protected readonly markdownService: MarkdownService) {
        super();
    }

    public generatePDF(options: GeneratorOptions): Promise<Buffer> {
        const body = this.markdownService.generateHTMLFromMarkdown(options.markdown);

        return this.generatePDFFromBodyContent(body);
    }
}
