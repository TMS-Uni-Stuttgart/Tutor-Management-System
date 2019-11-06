import React from 'react';
import 'github-markdown-css/github-markdown.css';
import MarkdownIt from 'markdown-it';
import HTMLParser from 'html-react-parser';

interface Props {
  markdown: string;
}

function convertMarkdownToHTML(markdown: string): string {
  const parser = new MarkdownIt();
  return parser.render(markdown);
}

function convertHTMLToJSX(html: string): React.ReactNode {
  return HTMLParser(html);
}

function Markdown({ markdown }: Props): JSX.Element {
  const html: string = convertMarkdownToHTML(markdown);
  const reactEl: React.ReactNode = convertHTMLToJSX(html);

  return <div className='markdown-body'>{reactEl}</div>;
}

export default Markdown;
