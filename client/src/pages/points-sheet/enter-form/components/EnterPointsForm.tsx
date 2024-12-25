import { Button, Typography } from '@mui/material';
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { Formik, useFormikContext } from 'formik';
import React, { useEffect, useState } from 'react';
import { unstable_usePrompt } from 'react-router-dom';
import { convertExercisePointInfoToString, getPointsOfAllExercises } from 'shared/model/Gradings';
import FormikDebugDisplay from '../../../../components/forms/components/FormikDebugDisplay';
import SubmitButton from '../../../../components/loading/SubmitButton';
import { useDialog } from '../../../../hooks/dialog-service/DialogService';
import { useKeyboardShortcut } from '../../../../hooks/useKeyboardShortcut';
import { Exercise } from '../../../../model/Exercise';
import { Grading } from '../../../../model/Grading';
import { Sheet } from '../../../../model/Sheet';
import { getPointsFromState as getAchievedPointsFromState } from '../EnterPoints.helpers';
import {
  generateInitialValues,
  PointsFormState,
  PointsFormSubmitCallback,
} from './EnterPointsForm.helpers';
import ExerciseBox from './ExerciseBox';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    },
    textBox: {
      display: 'flex',
      marginBottom: theme.spacing(1),
    },
    unsavedChangesText: {
      marginLeft: theme.spacing(1),
    },
    pointsText: {
      marginLeft: 'auto',
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

interface Props extends Omit<React.ComponentProps<'form'>, 'onSubmit'> {
  grading: Grading | undefined;
  sheet: Sheet;
  exercise: Exercise;
  onSubmit: PointsFormSubmitCallback;
}

type FormProps = Omit<Props, 'entity' | 'grading' | 'onSubmit'>;

function EnterPointsForm({ grading, ...props }: Props): JSX.Element {
  const { sheet, onSubmit } = props;

  const [initialValues, setInitialValues] = useState<PointsFormState>(
    generateInitialValues({ grading, sheet })
  );

  useEffect(() => {
    const values = generateInitialValues({ grading, sheet });
    setInitialValues(values);
  }, [grading, sheet]);

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} enableReinitialize>
      <EnterPointsFormInner {...props} />
    </Formik>
  );
}

function EnterPointsFormInner({ sheet, exercise, className, ...props }: FormProps): JSX.Element {
  const classes = useStyles();
  const dialog = useDialog();

  const formikContext = useFormikContext<PointsFormState>();
  const { values, handleSubmit, resetForm, isSubmitting, dirty, submitForm } = formikContext;

  const achieved = getAchievedPointsFromState(values);
  const total = getPointsOfAllExercises(sheet);
  const totalPoints = convertExercisePointInfoToString(total);

  const handleReset = () => {
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

  useKeyboardShortcut([{ key: 's', modifiers: { ctrlKey: true } }], (e) => {
    e.preventDefault();

    if (!dirty) {
      return;
    }

    submitForm();
  });

  // unstable_usePrompt({
  //   message: 'Es gibt ungespeicherte Änderungen. Soll die Seite wirklich verlassen werden?',
  //   when: dirty,
  // });

  return (
    <>
      <form {...props} onSubmit={handleSubmit} className={clsx(classes.root, className)}>
        <div className={classes.textBox}>
          <Typography className={classes.unsavedChangesText}>
            {dirty && <>Es gibt ungespeicherte Änderungen.</>}
          </Typography>

          <Typography
            className={classes.pointsText}
          >{`Gesamt: ${achieved} / ${totalPoints} Punkte`}</Typography>
        </div>

        <ExerciseBox
          className={classes.exerciseBox}
          name={`exercises.${exercise.id}`}
          exercise={exercise}
        />

        <div className={classes.buttonRow}>
          <Button
            variant='outlined'
            onClick={handleReset}
            className={classes.cancelButton}
            disabled={!dirty}
          >
            Zurücksetzen
          </Button>

          <SubmitButton
            color='primary'
            variant='outlined'
            isSubmitting={isSubmitting}
            disabled={!dirty}
          >
            Speichern
          </SubmitButton>
        </div>

        <FormikDebugDisplay showErrors />
      </form>
    </>
  );
}

export default EnterPointsForm;
