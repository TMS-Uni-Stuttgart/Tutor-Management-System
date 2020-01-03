import React from 'react';
import { FormikSubmitCallback } from '../../../../types';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { Team } from 'shared/dist/model/Team';
import { Exercise } from 'shared/dist/model/Sheet';
import ExerciseBox from './ExerciseBox';
import { Formik } from 'formik';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      overflowY: 'auto',
    },
    exerciseBox: {
      flex: 1,
    },
  })
);

interface PointsFormSubExerciseState {
  [subExerciseId: string]: string;
}

interface PointsFormExerciseState {
  comment: string;
  points: string | PointsFormSubExerciseState;
}

interface PointsFormState {
  comment: string;
  additionalPoints: string;
  exercises: {
    [exerciseId: string]: PointsFormExerciseState;
  };
}

export type PointsFormSubmitCallback = FormikSubmitCallback<PointsFormState>;

interface Props extends React.ComponentProps<'div'> {
  team: Team;
  exercise: Exercise;
}

function EnterPointsForm({ team, exercise, className, ...props }: Props): JSX.Element {
  const classes = useStyles();

  return (
    <div {...props} className={clsx(classes.root, className)}>
      <Formik initialValues={{ derp: { points: 5, comment: '' } }} onSubmit={() => {}}>
        {() => (
          <>
            <ExerciseBox className={classes.exerciseBox} name='derp' exercise={exercise} />
          </>
        )}
      </Formik>
    </div>
  );
}

export default EnterPointsForm;
