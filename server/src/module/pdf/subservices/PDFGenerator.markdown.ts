import { Injectable } from '@nestjs/common';
import { PDFGenerator } from './PDFGenerator.core';
import MarkdownIt = require('markdown-it');

interface GeneratorOptions {
  markdown: string;
}

@Injectable()
export class MarkdownPDFGenerator extends PDFGenerator<GeneratorOptions> {
  constructor() {
    super(undefined);
  }

  public generatePDF(options: GeneratorOptions): Promise<Buffer> {
    const body = this.generateHTMLFromMarkdown(options.markdown);

    return this.generatePDFFromBody(body);
  }

  private generateHTMLFromMarkdown(markdown: string): string {
    const parser = new MarkdownIt();
    const body = parser.render(markdown);

    return body;
  }
}
