import { IconButton, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { ChevronUp as OpenIcon } from 'mdi-material-ui';
import React from 'react';
import { Exercise, getPointsOfExercise } from 'shared/dist/model/Sheet';
import FormikTextField from '../../../../components/forms/components/FormikTextField';
import { getExerciseIdentifier } from '../../util/helper';
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
  const identifier = getExerciseIdentifier(exercise);
  const totalPoints = getPointsOfExercise(exercise);

  return (
    <div className={classes.exerciseBox}>
      <IconButton size='small' className={classes.exerciseBoxCollapseButton}>
        <OpenIcon />
      </IconButton>

      <div className={classes.exerciseHeader}>
        <Typography className={classes.exerciseName}>{`Aufgabe ${exercise.exName}`}</Typography>

        <Typography
          variant='body2'
          color='textSecondary'
        >{`## / ${totalPoints} Punkte`}</Typography>
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
              name={`${identifier}.points.${subEx.id}`}
              className={classes.pointsTextField}
              placeholder='0'
              maxPoints={getPointsOfExercise(subEx)}
            />
          </div>
        ))
      ) : (
        <PointsTextField
          name={`${identifier}.points`}
          className={clsx(classes.pointsTextField, classes.firstColumn)}
          placeholder='0'
          maxPoints={getPointsOfExercise(exercise)}
        />
      )}

      <FormikTextField
        name={`${identifier}.comment`}
        className={classes.commentaryTextField}
        style={{
          gridRow: `2 / span ${subexercises.length > 0 ? subexercises.length + 1 : 2}`,
        }}
        placeholder='Kommentar'
        multiline
      />
    </div>
  );
}

export default ExerciseBox;
