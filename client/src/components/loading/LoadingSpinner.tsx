import { CircularProgress, Theme, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    spinnerBox: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    fullHeight: {
      height: '100%',
    },
    spinner: {
      marginBottom: theme.spacing(3),
    },
  })
);

export interface LoadingSpinnerProps {
  shrinkBox?: boolean;
  text?: string;
}

function LoadingSpinner({ shrinkBox, text }: LoadingSpinnerProps): JSX.Element {
  const classes = useStyles();

  return (
    <div className={clsx(classes.spinnerBox, !shrinkBox && classes.fullHeight)}>
      <CircularProgress className={classes.spinner} color='primary' />

      <Typography variant='h5' color='primary'>
        {`${text || 'Lade Daten'}...`}
      </Typography>
    </div>
  );
}

export default LoadingSpinner;
