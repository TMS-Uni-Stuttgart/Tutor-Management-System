import { CircularProgress, Theme, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';

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
      <CircularProgress className={classes.spinner} color='primary' />

      <Typography variant='h5' color='primary'>
        Lade Daten...
      </Typography>
    </div>
  );
}

export default LoadingSpinner;
