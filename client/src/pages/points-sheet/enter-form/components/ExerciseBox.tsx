import { Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { useField } from 'formik';
import React from 'react';
import { convertExercisePointInfoToString, getPointsOfExercise } from 'shared/model/Gradings';
import FormikMarkdownTextfield from '../../../../components/forms/components/FormikMarkdownTextfield';
import PointsTextField from '../../../../components/PointsTextField';
import { Exercise } from '../../../../model/Exercise';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      borderRadius: theme.shape.borderRadius,
      border: `1px solid ${theme.palette.divider}`,
      padding: theme.spacing(1),
      marginBottom: theme.spacing(2),
      '&:last-of-type': {
        marginBottom: 0,
      },
    },
    exerciseBox: {
      width: 250,
      display: 'flex',
      flexDirection: 'column',
    },
    exerciseHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: theme.spacing(1),
    },
    exerciseName: {
      flex: 1,
    },
    subexerciseTextFieldContainer: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: theme.spacing(1),
    },
    subexerciseName: {
      marginRight: theme.spacing(1),
    },
    commentBox: {
      display: 'flex',
      flexDirection: 'column',
      marginLeft: theme.spacing(2),
      flex: 1,
    },
    commentHeader: {
      marginBottom: theme.spacing(1),
    },
  })
);

interface Props extends React.ComponentProps<'div'> {
  name: string;
  exercise: Exercise;
}

type ExerciseBoxSubexerciseFormState = { [subExId: string]: string };

export type ExerciseBoxFormState = {
  points: string | ExerciseBoxSubexerciseFormState;
  comment: string;
};

function getPointsFromBoxValue({ points }: ExerciseBoxFormState): number {
  if (typeof points === 'string') {
    return points ? Number.parseFloat(points) : 0;
  }

  return Object.values(points).reduce(
    (sum, value) => (value ? sum + Number.parseFloat(value) : sum),
    0
  );
}

function ExerciseBox({ name, exercise, className, ...props }: Props): JSX.Element | null {
  const classes = useStyles();
  const [{ value }] = useField<ExerciseBoxFormState>(name);

  if (!value) {
    return null;
  }

  const { subexercises } = exercise;
  const pointsOfExercise = getPointsOfExercise(exercise);
  const achievedPoints = getPointsFromBoxValue(value);
  const totalPoints = convertExercisePointInfoToString(pointsOfExercise);

  return (
    <div {...props} className={clsx(className, classes.root)}>
      <div className={classes.exerciseBox}>
        <div className={classes.exerciseHeader}>
          <Typography className={classes.exerciseName}>{`Aufgabe ${exercise.exName}`}</Typography>

          <Typography
            variant='body2'
            color='textSecondary'
          >{`${achievedPoints} / ${totalPoints} Punkte`}</Typography>
        </div>

        {subexercises.length > 0 ? (
          subexercises.map((subEx) => (
            <div key={subEx.id} className={classes.subexerciseTextFieldContainer}>
              <Typography className={classes.subexerciseName}>{subEx.exName}</Typography>

              <PointsTextField
                name={`${name}.points.${subEx.id}`}
                placeholder='0'
                maxPoints={subEx.pointInfo}
              />
            </div>
          ))
        ) : (
          <PointsTextField
            name={`${name}.points`}
            placeholder='0'
            maxPoints={getPointsOfExercise(exercise)}
          />
        )}
      </div>

      <div className={classes.commentBox}>
        <Typography className={classes.commentHeader}>Kommentar</Typography>

        <FormikMarkdownTextfield name={`${name}.comment`} placeholder='Kommentar eingeben...' />
      </div>
    </div>
  );
}

export default ExerciseBox;
