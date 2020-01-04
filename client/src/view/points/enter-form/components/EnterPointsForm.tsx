import { Button, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { Formik, FormikHelpers } from 'formik';
import React, { useEffect, useState } from 'react';
import { PointId, PointMap, PointMapEntry, PointsOfSubexercises } from 'shared/dist/model/Points';
import { Exercise, Sheet } from 'shared/dist/model/Sheet';
import { Team } from 'shared/dist/model/Team';
import FormikDebugDisplay from '../../../../components/forms/components/FormikDebugDisplay';
import SubmitButton from '../../../../components/forms/components/SubmitButton';
import { useDialog } from '../../../../hooks/DialogService';
import { FormikSubmitCallback } from '../../../../types';
import ExerciseBox from './ExerciseBox';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    },
    unsavedChangesText: {
      marginLeft: theme.spacing(1),
      marginBottom: theme.spacing(1),
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
    dialogDeleteButton: {
      color: theme.palette.error.main,
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

interface InitialValuesOptions {
  team: Team;
  sheet: Sheet;
}

interface GeneratePointsSubexerciseParams {
  exercise: Exercise;
  pointsOfTeam: PointMapEntry;
}

function getDefaultPointMapEntry(exercise: Exercise): PointMapEntry {
  if (exercise.subexercises.length > 0) {
    const points: PointsOfSubexercises = {};

    exercise.subexercises.forEach(subEx => {
      points[subEx.id] = 0;
    });

    return {
      comment: '',
      points,
    };
  } else {
    return {
      comment: '',
      points: 0,
    };
  }
}

function generatePointStateWithSubexercises({
  exercise,
  pointsOfTeam,
}: GeneratePointsSubexerciseParams): PointsFormSubExerciseState {
  const { subexercises } = exercise;

  return subexercises.reduce<PointsFormSubExerciseState>((prev, current) => {
    if (typeof pointsOfTeam.points === 'number') {
      return prev;
    }

    const pointsOfSubEx = pointsOfTeam.points[current.id];

    return { ...prev, [current.id]: pointsOfSubEx?.toString() ?? '0' };
  }, {});
}

function generateInitialValues({ team, sheet }: InitialValuesOptions): PointsFormState {
  const pointMap = new PointMap(team.points);
  const exercises: { [id: string]: PointsFormExerciseState } = {};

  sheet.exercises.forEach(exercise => {
    const pointsOfTeam =
      pointMap.getPointEntry(new PointId(sheet.id, exercise.id)) ??
      getDefaultPointMapEntry(exercise);

    if (exercise.subexercises.length > 0) {
      const points: PointsFormSubExerciseState = generatePointStateWithSubexercises({
        exercise,
        pointsOfTeam,
      });

      exercises[exercise.id] = {
        comment: pointsOfTeam.comment ?? '',
        points,
      };
    } else {
      exercises[exercise.id] = {
        comment: pointsOfTeam.comment ?? '',
        points: pointsOfTeam.points.toString() ?? '0',
      };
    }
  });

  return {
    comment: '',
    additionalPoints: '0',
    exercises,
  };
}

interface Props extends Omit<React.ComponentProps<'form'>, 'onSubmit'> {
  team: Team;
  sheet: Sheet;
  exercise: Exercise;
  onSubmit: PointsFormSubmitCallback;
}

function EnterPointsForm({
  team,
  sheet,
  exercise,
  className,
  onSubmit,
  ...props
}: Props): JSX.Element {
  const classes = useStyles();
  const dialog = useDialog();

  const [initialValues, setInitialValues] = useState<PointsFormState>(
    generateInitialValues({ team, sheet })
  );

  useEffect(() => {
    const values = generateInitialValues({ team, sheet });
    setInitialValues(values);
  }, [team, sheet]);

  const handleReset = (resetForm: FormikHelpers<PointsFormState>['resetForm']) => () => {
    dialog.show({
      title: 'Eingaben zurücksetzen?',
      content:
        'Sollen die Eingaben für dieses Team und das aktuelle Übungsblatt zurückgesetzt werden? Dies kann nicht rückgängig gemacht werden.',
      actions: [
        {
          label: 'Nicht zurücksetzen',
          onClick: () => dialog.hide(),
        },
        {
          label: 'Zurücksetzen',
          onClick: () => {
            resetForm();
            dialog.hide();
          },
          buttonProps: {
            className: classes.dialogDeleteButton,
          },
        },
      ],
    });
  };

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} enableReinitialize>
      {({ handleSubmit, isSubmitting, initialValues, values, errors, resetForm }) => (
        <form {...props} onSubmit={handleSubmit} className={clsx(classes.root, className)}>
          <Typography className={classes.unsavedChangesText}>
            {initialValues !== values && <>Es gibt ungespeicherte Änderungen.</>}
          </Typography>

          <ExerciseBox
            className={classes.exerciseBox}
            name={`exercises.${exercise.id}`}
            exercise={exercise}
          />

          <div className={classes.buttonRow}>
            <Button
              variant='outlined'
              onClick={handleReset(resetForm)}
              className={classes.cancelButton}
            >
              Zurücksetzen
            </Button>

            <SubmitButton color='primary' variant='outlined' isSubmitting={isSubmitting}>
              Speichern
            </SubmitButton>
          </div>

          <FormikDebugDisplay values={values} errors={errors} />
        </form>
      )}
    </Formik>
  );
}

export default EnterPointsForm;
