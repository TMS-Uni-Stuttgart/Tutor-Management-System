import { Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import 'github-markdown-css/github-markdown.css';
import 'highlight.js/styles/googlecode.css';
import HTMLParser from 'html-react-parser';
import React, { useEffect, useMemo } from 'react';
import { getHTMLFromMarkdown } from '../../hooks/fetching/Markdown';
import { useFetchState } from '../../hooks/useFetchState';
import { useLogger } from '../../util/Logger';
import LoadingSpinner from '../loading/LoadingSpinner';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    background: {
      padding: theme.spacing(1),
      color: theme.palette.text.primary,
      '& table tr': {
        backgroundColor: 'transparent',
      },
      '& code': {
        backgroundColor:
          theme.palette.type === 'light' ? 'rgba(27, 31, 35, .05)' : 'rgba(174, 183, 191, .2)',
      },
      '& pre': {
        backgroundColor:
          theme.palette.type === 'light' ? 'rgba(27, 31, 35, .05)' : 'rgba(220, 220, 220, 1)',
        color: '#000',
      },
    },
  })
);

interface Props extends React.ComponentProps<'div'> {
  markdown?: string;
  html?: string;
}

function convertHTMLToJSX(html: string): React.ReactNode {
  return HTMLParser(html.replace(/>\r?\n|\r/g, '>'));
}

function Markdown({ markdown, html: htmlFromProps, className, ...props }: Props): JSX.Element {
  const classes = useStyles();
  const logger = useLogger('Markdown');

  const fetchFunction = useMemo(
    () => async (markdownString?: string) => {
      if (!!htmlFromProps) {
        return htmlFromProps;
      }

      if (!markdownString) {
        return '';
      }

      logger.log('Loading Markdown...');
      const markdown = await getHTMLFromMarkdown(markdownString);
      logger.log('Markdown loaded.');

      return markdown;
    },
    [htmlFromProps, logger]
  );

  const [html, isLoading, , execute] = useFetchState({
    fetchFunction,
    immediate: false,
  });

  useEffect(() => {
    execute(markdown);
  }, [markdown, execute, logger]);

  const reactEl: React.ReactNode = convertHTMLToJSX(html ?? '');

  if (isLoading) {
    return (
      <div {...props}>
        <LoadingSpinner text='Lade Markdownvorschau...' shrinkBox />
      </div>
    );
  }

  return (
    <div className={clsx(classes.background, className, 'markdown-body')} {...props}>
      {!!html ? reactEl : <Typography>Keine Vorschau verfügbar.</Typography>}
    </div>
  );
}

export default Markdown;
