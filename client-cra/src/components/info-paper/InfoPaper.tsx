import { Paper, PaperProps, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';

const useStyles = makeStyles((theme) =>
  createStyles({
    summaryPaper: {
      flex: 1,
      background: theme.palette.background.default,
      padding: theme.spacing(1.5),
      position: 'relative',
    },
    title: {
      textAlign: 'center',
      marginBottom: theme.spacing(1),
    },
  })
);

export interface InfoPaperProps extends PaperProps {
  title: string;
  children?: React.ReactNode;
}

function InfoPaper({ children, title, className, ...props }: InfoPaperProps): JSX.Element {
  const classes = useStyles();

  return (
    <Paper variant='outlined' {...props} className={clsx(className, classes.summaryPaper)}>
      <Typography className={classes.title}>{title}</Typography>

      {children}
    </Paper>
  );
}

export default InfoPaper;
