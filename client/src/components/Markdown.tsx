import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import 'github-markdown-css/github-markdown.css';
import HTMLParser from 'html-react-parser';
import MarkdownIt from 'markdown-it';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    background: {
      padding: theme.spacing(1),
      color: theme.palette.text.primary,
    },
  })
);

interface Props extends React.ComponentProps<'div'> {
  markdown: string;
}

function convertMarkdownToHTML(markdown: string): string {
  const parser = new MarkdownIt();
  return parser.render(markdown);
}

function convertHTMLToJSX(html: string): React.ReactNode {
  return HTMLParser(html);
}

function Markdown({ markdown, className, ...props }: Props): JSX.Element {
  const classes = useStyles();
  const html: string = convertMarkdownToHTML(markdown);
  const reactEl: React.ReactNode = convertHTMLToJSX(html);

  return (
    <div className={clsx('markdown-body', classes.background, className)} {...props}>
      {reactEl}
    </div>
  );
}

export default Markdown;
