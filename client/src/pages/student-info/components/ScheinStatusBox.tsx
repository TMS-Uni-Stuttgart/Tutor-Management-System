import { Box, BoxProps, CircularProgress, Typography } from '@material-ui/core';
import { createStyles, makeStyles, useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';
import { ScheinCriteriaSummary } from 'shared/model/ScheinCriteria';

const useStyles = makeStyles((theme) =>
  createStyles({
    statusLoadingSpinner: {
      marginRight: theme.spacing(1),
    },
    greenFont: {
      color: theme.palette.green.main,
    },
    redFont: {
      color: theme.palette.red.main,
    },
  })
);

interface Props extends BoxProps {
  scheinStatus?: ScheinCriteriaSummary;
}

function ScheinStatusBox({ scheinStatus, ...props }: Props): JSX.Element {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <Box
      display='flex'
      alignItems='center'
      textAlign='center'
      border={1}
      borderRadius={4}
      borderColor={
        scheinStatus
          ? scheinStatus.passed
            ? theme.palette.green.main
            : theme.palette.red.main
          : 'divider'
      }
      padding='5px 15px'
      {...props}
    >
      {scheinStatus ? (
        <Typography
          variant='button'
          className={clsx({
            [classes.greenFont]: scheinStatus.passed,
            [classes.redFont]: !scheinStatus.passed,
          })}
        >
          Schein {scheinStatus.passed ? 'bestanden' : 'nicht bestanden'}
        </Typography>
      ) : (
        <>
          <CircularProgress size='1rem' className={classes.statusLoadingSpinner} />
          <Typography variant='button'>Lade Status...</Typography>
        </>
      )}
    </Box>
  );
}

export default ScheinStatusBox;
