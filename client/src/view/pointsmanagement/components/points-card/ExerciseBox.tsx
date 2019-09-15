import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { IconButton, Typography, TextField } from '@material-ui/core';
import { getPointsOfExercise, Exercise } from 'shared/dist/model/Sheet';
import { ChevronUp as OpenIcon } from 'mdi-material-ui';
import clsx from 'clsx';
import PointsTextField from './PointsTextField';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    exerciseBox: {
      display: 'grid',
      position: 'relative',
      gridTemplateColumns: '250px 1fr',
      gridColumnGap: theme.spacing(2),
      gridRowGap: theme.spacing(1),
      borderRadius: theme.shape.borderRadius,
      border: `1px solid ${theme.palette.divider}`,
      padding: theme.spacing(1),
      marginBottom: theme.spacing(2),
      '&:last-of-type': {
        marginBottom: 0,
      },
    },
    exerciseBoxCollapseButton: {
      position: 'absolute',
      top: 4,
      right: theme.spacing(1),
    },
    exerciseHeader: {
      display: 'flex',
      alignItems: 'center',
    },
    exerciseName: {
      flex: 1,
    },
    firstColumn: {
      gridColumn: '1',
    },
    subexerciseTextFieldContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    subexerciseName: {
      marginRight: theme.spacing(1),
    },
    pointsTextField: {
      '& input': {
        width: 'unset',
        flex: 1,
        textAlign: 'right',
      },
    },
    commentaryTextField: {
      gridColumn: '2',
    },
  })
);

interface Props {
  exercise: Exercise;
}

function ExerciseBox({ exercise }: Props): JSX.Element {
  const classes = useStyles();
  const { subexercises } = exercise;

  return (
    <div key={exercise.id} className={classes.exerciseBox}>
      <IconButton size='small' className={classes.exerciseBoxCollapseButton}>
        <OpenIcon />
      </IconButton>

      <div className={classes.exerciseHeader}>
        <Typography className={classes.exerciseName}>{`Aufgabe ${exercise.exName}`}</Typography>
        <Typography variant='body2' color='textSecondary'>{`## / ${getPointsOfExercise(
          exercise
        )} Punkte`}</Typography>
      </div>

      <Typography>Kommentar</Typography>

      {subexercises.length > 0 ? (
        subexercises.map(subEx => (
          <div
            key={subEx.id}
            className={clsx(classes.subexerciseTextFieldContainer, classes.firstColumn)}
          >
            <Typography className={classes.subexerciseName}>{subEx.exName}</Typography>

            <PointsTextField
              className={classes.pointsTextField}
              placeholder='0'
              points={getPointsOfExercise(subEx).toString()}
            />
          </div>
        ))
      ) : (
        <PointsTextField
          className={clsx(classes.pointsTextField, classes.firstColumn)}
          placeholder='0'
          points={getPointsOfExercise(exercise).toString()}
        />
      )}

      <TextField
        className={classes.commentaryTextField}
        style={{
          gridRow: `2 / span ${subexercises.length > 0 ? subexercises.length + 1 : 2}`,
        }}
        placeholder='Kommentar'
        variant='outlined'
        multiline
      />
    </div>
  );
}

export default ExerciseBox;
