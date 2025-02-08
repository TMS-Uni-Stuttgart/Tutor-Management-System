import { Box, Button, Typography } from '@mui/material';
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { Formik, useFormikContext } from 'formik';
import React, { useEffect, useState } from 'react';
import {
  convertExercisePointInfoToString,
  getPointsOfAllExercises,
  SheetState,
} from 'shared/model/Gradings';
import FormikDebugDisplay from '../../../../components/forms/components/FormikDebugDisplay';
import SubmitButton from '../../../../components/loading/SubmitButton';
import SplitButton from '../../../../components/SplitButton';
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
      alignItems: 'center',
      marginBottom: theme.spacing(1),
    },
    unsavedChangesText: {
      marginLeft: theme.spacing(1),
    },
    pointsText: {
      marginLeft: 'auto',
      marginRight: theme.spacing(2),
    },
    exerciseBox: {
      flex: 1,
    },
    buttonRow: {
      display: 'flex',
      justifyContent: 'flex-end',
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
  exercise: Exercise[];
  onSubmit: PointsFormSubmitCallback;
  setIsAutoSubmitting: (isAutoSubmitting: boolean) => void;
}

type FormProps = Omit<Props, 'entity' | 'grading' | 'onSubmit'>;

function EnterPointsForm({ grading, setIsAutoSubmitting, ...props }: Props): JSX.Element {
  const { sheet, onSubmit } = props;

  const [initialValues, setInitialValues] = useState<PointsFormState>(
    generateInitialValues({ grading, sheet })
  );

  useEffect(() => {
    setInitialValues(generateInitialValues({ grading, sheet }));
  }, [grading, sheet]);

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} enableReinitialize>
      <EnterPointsFormInner setIsAutoSubmitting={setIsAutoSubmitting} {...props} />
    </Formik>
  );
}

function EnterPointsFormInner({
  sheet,
  exercise,
  className,
  setIsAutoSubmitting,
  ...props
}: FormProps): JSX.Element {
  const classes = useStyles();
  const dialog = useDialog();
  const formikContext = useFormikContext<PointsFormState>();

  const { values, handleSubmit, resetForm, isSubmitting, dirty, submitForm, setFieldValue } =
    formikContext;

  const achieved = getAchievedPointsFromState(values);
  const total = getPointsOfAllExercises(sheet);
  const totalPoints = convertExercisePointInfoToString(total);
  const autosaveInterval = 60 * 1000;

  useEffect(() => {
    const interval = setInterval(() => {
      if (dirty && !isSubmitting) {
        setIsAutoSubmitting(true);
        handleSubmit();
      }
    }, autosaveInterval);

    return () => {
      clearInterval(interval);
    };
  }, [dirty, values]);

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
    if (dirty) submitForm();
  });

  const handleOnMenuItemClick = (index: number) => {
    if (index === 0) {
      setFieldValue('sheetState', SheetState.PASSED);
    } else {
      setFieldValue('sheetState', SheetState.NOT_PASSED);
    }
  };

  const toggleSheetState = (newState: SheetState) => {
    const newSheetState = values.sheetState === newState ? SheetState.NO_STATE : newState;
    setFieldValue('sheetState', newSheetState);
  };

  const buttonColor =
    values.sheetState === SheetState.PASSED
      ? 'success'
      : values.sheetState === SheetState.NOT_PASSED
        ? 'error'
        : 'inherit';

  const initiallySelected =
    values.sheetState === SheetState.PASSED
      ? 0
      : values.sheetState === SheetState.NOT_PASSED
        ? 1
        : 0;

  return (
    <>
      <form {...props} onSubmit={handleSubmit} className={clsx(classes.root, className)}>
        <div className={classes.textBox}>
          {dirty && (
            <Typography className={classes.unsavedChangesText}>
              Es gibt ungespeicherte Änderungen.
            </Typography>
          )}
          <Typography className={classes.pointsText}>
            {`Gesamt: ${achieved} / ${totalPoints} Punkte`}
          </Typography>

          <SplitButton
            variant='outlined'
            color={buttonColor}
            initiallySelected={initiallySelected}
            onMenuItemClick={handleOnMenuItemClick}
            options={[
              {
                label: 'Als bestanden markieren',
                ButtonProps: {
                  onClick: () => {
                    toggleSheetState(SheetState.PASSED);
                  },
                },
              },
              {
                label: 'Als nicht bestanden markieren',
                ButtonProps: {
                  onClick: () => {
                    toggleSheetState(SheetState.NOT_PASSED);
                  },
                },
              },
            ]}
          />
        </div>

        <Box display='flex' flexDirection='column' flex={1}>
          {exercise.map((ex) => (
            <ExerciseBox
              key={ex.id}
              className={classes.exerciseBox}
              name={`exercises.${ex.id}`}
              exercise={ex}
            />
          ))}
        </Box>
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
