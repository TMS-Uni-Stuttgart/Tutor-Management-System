import React from 'react';
import { FormikSubmitCallback } from '../../../../types';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      background: 'red',
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

type Props = React.ComponentProps<'div'>;

function EnterPointsForm({ className, ...props }: Props): JSX.Element {
  const classes = useStyles();

  return <div {...props} className={clsx(classes.root, className)}></div>;
}

export default EnterPointsForm;
