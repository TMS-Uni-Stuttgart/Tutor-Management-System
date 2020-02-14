import React, { useState, useEffect } from 'react';
import { Student } from 'shared/model/Student';
import { ScheinExam } from 'shared/model/Scheinexam';
import {
  ScheinexamPointsFormSubmitCallback,
  generateInitialValues,
  ScheinexamPointsFormState,
  getPointsFromState,
} from './ScheinexamPointsForm.helpers';
import { Formik, useFormikContext } from 'formik';
import { Prompt } from 'react-router';
import clsx from 'clsx';
import { Box, Paper, Typography, Grid, Button } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import PointsTextField from '../../../../components/PointsTextField';
import {
  getPointsOfExercise,
  getPointsOfAllExercises,
  convertExercisePointInfoToString,
} from 'shared/model/Points';
import SubmitButton from '../../../../components/loading/SubmitButton';
import { useDialog } from '../../../../hooks/DialogService';
import FormikDebugDisplay from '../../../../components/forms/components/FormikDebugDisplay';
import { useKeyboardShortcut } from '../../../../hooks/useKeyboardShortcut';

const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    },
    unsavedChangesText: {
      marginLeft: theme.spacing(1),
    },
    pointsText: {
      marginLeft: 'auto',
      marginRight: theme.spacing(0.5),
    },
    exerciseBox: {
      flex: 1,
      background: theme.palette.background.default,
      overflowX: 'hidden',
      overflowY: 'auto',
    },
    exerciseName: {
      marginRight: theme.spacing(1),
      flexShrink: 0,
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
  student: Student;
  exam: ScheinExam;
  onSubmit: ScheinexamPointsFormSubmitCallback;
}

type FormProps = Omit<Props, 'student' | 'onSubmit'>;

function ScheinexamPointsForm({ student, onSubmit, exam, ...props }: Props): JSX.Element {
  const [initialValues, setInitialValues] = useState<ScheinexamPointsFormState>(
    generateInitialValues({ student, exam })
  );

  useEffect(() => {
    const values = generateInitialValues({ student, exam });
    setInitialValues(values);
  }, [student, exam]);

  return (
    <Formik key={student.id} initialValues={initialValues} onSubmit={onSubmit} enableReinitialize>
      <ScheinexamPointsFormInner {...props} exam={exam} />
    </Formik>
  );
}

function ScheinexamPointsFormInner({ exam, className, ...props }: FormProps): JSX.Element {
  const classes = useStyles();

  const formikContext = useFormikContext<ScheinexamPointsFormState>();
  const {
    values,
    errors,
    handleSubmit,
    resetForm,
    isSubmitting,
    dirty,
    submitForm,
  } = formikContext;

  const dialog = useDialog();

  const achieved = getPointsFromState(values);
  const total = getPointsOfAllExercises(exam);
  const totalPoints = convertExercisePointInfoToString(total);

  useKeyboardShortcut([{ key: 's', modifiers: { ctrlKey: true } }], e => {
    e.preventDefault();

    if (!dirty) {
      return;
    }

    submitForm();
  });

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

  return (
    <>
      <Prompt
        when={dirty}
        message='Es gibt ungespeichert Änderungen. Soll die Seite wirklich verlassen werden?'
      />

      <form {...props} onSubmit={handleSubmit} className={clsx(classes.root, className)}>
        <Box display='flex' marginBottom={1}>
          <Typography className={classes.unsavedChangesText}>
            {dirty && <>Es gibt ungespeicherte Änderungen.</>}
          </Typography>

          <Typography
            className={classes.pointsText}
          >{`Gesamt: ${achieved} / ${totalPoints} Punkte`}</Typography>
        </Box>

        <Paper variant='outlined' className={classes.exerciseBox}>
          <Grid container spacing={1}>
            {exam.exercises.map(exercise => (
              <Grid key={exercise.id} item sm={12} md={6} lg={4} xl={3}>
                <Box display='flex' alignItems='center' marginBottom={1} padding={2}>
                  <Typography className={classes.exerciseName}>
                    Aufgabe {exercise.exName}
                  </Typography>

                  <PointsTextField
                    name={`${exercise.id}.points`}
                    placeholder='0'
                    maxPoints={getPointsOfExercise(exercise)}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Box display='flex' justifyContent='flex-end' marginBottom={0.5} marginTop={2}>
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
        </Box>

        <FormikDebugDisplay values={values} errors={errors} />
      </form>
    </>
  );
}

export default ScheinexamPointsForm;
