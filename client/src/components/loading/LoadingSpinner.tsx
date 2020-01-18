import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { CircularProgress, Typography, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    spinnerBox: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    spinner: {
      marginBottom: theme.spacing(3),
    },
  })
);

function LoadingSpinner(): JSX.Element {
  const classes = useStyles();

  return (
    <div className={classes.spinnerBox}>
      <CircularProgress className={classes.spinner} />

      <Typography variant='h5' color='primary'>
        Lade Daten...
      </Typography>
    </div>
  );
}

export default LoadingSpinner;
