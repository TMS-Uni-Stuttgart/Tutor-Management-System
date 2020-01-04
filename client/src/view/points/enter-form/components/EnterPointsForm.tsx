import React from 'react';
import { FormikSubmitCallback } from '../../../../types';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { Team } from 'shared/dist/model/Team';
import { Exercise } from 'shared/dist/model/Sheet';
import ExerciseBox from './ExerciseBox';
import { Formik } from 'formik';
import SubmitButton from '../../../../components/forms/components/SubmitButton';
import { Button } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    },
    exerciseBox: {
      overflowY: 'auto',
      flex: 1,
    },
    buttonRow: {
      display: 'flex',
      justifyContent: 'flex-end',
      // This prevents a flashing scrollbar if the form spinner is shown.
      marginBottom: theme.spacing(0.5),
    },
    cancelButton: {
      marginRight: theme.spacing(2),
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

interface Props extends Omit<React.ComponentProps<'form'>, 'onSubmit'> {
  team: Team;
  exercise: Exercise;
  onSubmit: PointsFormSubmitCallback;
}

interface InitialValuesOptions {
  team: Team;
  exercise: Exercise;
}

function generateInitialValues({ team, exercise }: InitialValuesOptions): PointsFormState {
  // TODO: Implement me!

  return {
    comment: '',
    additionalPoints: '0',
    exercises: {
      [exercise.id]: {
        comment: '',
        points: '5',
      },
    },
  };
}

function EnterPointsForm({ team, exercise, className, onSubmit, ...props }: Props): JSX.Element {
  const classes = useStyles();
  const initialValues = generateInitialValues({ team, exercise });

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {({ handleSubmit, isSubmitting }) => (
        <form {...props} onSubmit={handleSubmit} className={clsx(classes.root, className)}>
          <ExerciseBox
            className={classes.exerciseBox}
            name={`exercises.${exercise.id}`}
            exercise={exercise}
          />

          <div className={classes.buttonRow}>
            <Button variant='outlined' onClick={() => {}} className={classes.cancelButton}>
              Abbrechen
            </Button>

            <SubmitButton color='primary' variant='outlined' isSubmitting={isSubmitting}>
              Speichern
            </SubmitButton>
          </div>
        </form>
      )}
    </Formik>
  );
}

export default EnterPointsForm;
