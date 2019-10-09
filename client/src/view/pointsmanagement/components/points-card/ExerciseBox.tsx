import { Typography, Collapse } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { useField } from 'formik';
import React, { useState } from 'react';
import { getPointsOfExercise } from 'shared/dist/model/Points';
import { Exercise } from 'shared/dist/model/Sheet';
import CollapseButton from '../../../../components/CollapseButton';
import { PointsCardFormExerciseState } from './PointsCard';
import PointsTextField from './PointsTextField';
import FormikMarkdownTextfield from '../../../../components/forms/components/FormikMarkdownTextfield';

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
    commentHeader: {
      cursor: 'pointer',
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
  name: string;
  exercise: Exercise;
}

function getPointsFromBoxValue({ points }: PointsCardFormExerciseState): number {
  if (typeof points === 'string') {
    return points ? Number.parseFloat(points) : 0;
  }

  return Object.values(points).reduce(
    (sum, value) => (value ? sum + Number.parseFloat(value) : sum),
    0
  );
}

function ExerciseBox({ name, exercise }: Props): JSX.Element | null {
  const classes = useStyles();
  const [{ value }] = useField(name);
  const [isCommentCollapsed, setCommentCollapsed] = useState(false);

  if (!value) {
    return null;
  }

  const { subexercises } = exercise;
  const achievedPoints = getPointsFromBoxValue(value);
  const totalPoints = getPointsOfExercise(exercise);

  return (
    <div className={classes.exerciseBox}>
      <CollapseButton
        isCollapsed={isCommentCollapsed}
        size='small'
        className={classes.exerciseBoxCollapseButton}
        tabIndex={-1}
        onClick={() => setCommentCollapsed(!isCommentCollapsed)}
      />

      <div className={classes.exerciseHeader}>
        <Typography className={classes.exerciseName}>{`Aufgabe ${exercise.exName}`}</Typography>

        <Typography
          variant='body2'
          color='textSecondary'
        >{`${achievedPoints} / ${totalPoints} Punkte`}</Typography>
      </div>

      <Typography
        className={classes.commentHeader}
        onClick={() => setCommentCollapsed(!isCommentCollapsed)}
      >
        Kommentar
      </Typography>

      {subexercises.length > 0 ? (
        subexercises.map(subEx => (
          <div
            key={subEx.id}
            className={clsx(classes.subexerciseTextFieldContainer, classes.firstColumn)}
          >
            <Typography className={classes.subexerciseName}>{subEx.exName}</Typography>

            <PointsTextField
              name={`${name}.points.${subEx.id}`}
              className={classes.pointsTextField}
              placeholder='0'
              maxPoints={getPointsOfExercise(subEx)}
            />
          </div>
        ))
      ) : (
        <PointsTextField
          name={`${name}.points`}
          className={clsx(classes.pointsTextField, classes.firstColumn)}
          placeholder='0'
          maxPoints={getPointsOfExercise(exercise)}
        />
      )}

      <Collapse
        in={!isCommentCollapsed}
        className={classes.commentaryTextField}
        style={{
          gridRow: `2 / span ${subexercises.length > 0 ? subexercises.length + 1 : 2}`,
        }}
      >
        <FormikMarkdownTextfield name={`${name}.comment`} placeholder='Kommentar' />
      </Collapse>
    </div>
  );
}

export default ExerciseBox;
