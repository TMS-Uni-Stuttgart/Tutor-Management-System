import { Box, BoxProps, CircularProgress, Theme, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';

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

export interface LoadingSpinnerProps extends BoxProps {
  shrinkBox?: boolean;
  text?: string;
}

function LoadingSpinner({ shrinkBox, text, ...props }: LoadingSpinnerProps): JSX.Element | null {
  const classes = useStyles();
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setShowSpinner(true), 500);
    return () => clearTimeout(id);
  }, []);

  if (!showSpinner) {
    return null;
  }

  return (
    <Box
      display='flex'
      flexDirection='column'
      width='100%'
      alignItems='center'
      justifyContent='center'
      {...props}
      className={clsx(!shrinkBox && classes.fullHeight, props.className)}
    >
      <CircularProgress className={classes.spinner} color='primary' />

      <Typography variant='h5' color='primary'>
        {`${text || 'Lade Daten'}...`}
      </Typography>
    </Box>
  );
}

export default LoadingSpinner;
