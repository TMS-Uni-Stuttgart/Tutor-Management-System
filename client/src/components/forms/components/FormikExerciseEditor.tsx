import { Button, IconButton } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { ErrorMessage, FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { MinusBox as MinusIcon, PlusBox as PlusIcon } from 'mdi-material-ui';
import React from 'react';
import { Exercise } from 'shared/dist/model/Sheet';
import FormikCheckbox from './FormikCheckbox';
import FormikTextField from './FormikTextField';
import clsx from 'clsx';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    exerciseBox: {
      gridColumn: '1 / span 2',
      display: 'flex',
      flexDirection: 'column',
    },
    exercise: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr max-content 56px',
      gridColumnGap: theme.spacing(1),
      borderBottom: `1.5px solid ${theme.palette.divider}`,
      padding: theme.spacing(1.5, 2, 1.5, 2),
      justifyContent: 'center',
      marginTop: theme.spacing(1),
      '&:first-of-type': {
        borderTop: `1.5px solid ${theme.palette.divider}`,
      },
    },
    subexercise: {
      paddingLeft: theme.spacing(4),
    },
    addButton: {
      marginTop: theme.spacing(1),
    },
    deleteButton: {
      color: theme.palette.error.light,
    },
    iconInButton: {
      marginRight: theme.spacing(1),
    },
    errorMessage: {
      color: theme.palette.error.main,
      textAlign: 'right',
    },
  })
);

interface Props {
  name: string;
}

function FormikExerciseEditor({ name }: Props): JSX.Element {
  const classes = useStyles();
  const { values } = useFormikContext();

  const exercises: Exercise[] = values[name] || [];

  function handleExerciseDelete(idx: number, arrayHelpers: FieldArrayRenderProps) {
    return () => {
      // FIXME: Adjust so it'll still works with new sub-exercise prop 'exName'.
      const exercises: readonly Exercise[] = arrayHelpers.form.values[name];
      // const removedExercise: Exercise = exercises[idx];
      const updatedExercises = [...exercises.slice(0, idx), ...exercises.slice(idx + 1)];
      // .map(ex => {
      //   if (ex.exNo > removedExercise.exNo) {
      //     return {
      //       ...ex,
      //       exNo: ex.exNo - 1,
      //     };
      //   }

      //   return ex;
      // });

      arrayHelpers.form.setFieldValue(name, updatedExercises);
    };
  }

  return (
    <FieldArray
      name={name}
      render={arrayHelpers => (
        <div className={classes.exerciseBox}>
          {exercises.map((ex, idx) => (
            <>
              <div key={idx} className={classes.exercise}>
                <FormikTextField
                  name={`${name}.${idx}.exName`}
                  label='Aufgabennummer'
                  type='number'
                  fullWidth={false}
                  inputProps={{ min: 0, step: 1 }}
                />

                <FormikTextField
                  name={`${name}.${idx}.maxPoints`}
                  label='Punkte'
                  type='number'
                  fullWidth={false}
                  inputProps={{ min: 0, step: 0.1 }}
                />

                <FormikCheckbox name={`${name}.${idx}.bonus`} label='Bonusaufgabe' />

                <IconButton
                  className={classes.deleteButton}
                  onClick={handleExerciseDelete(idx, arrayHelpers)}
                >
                  <MinusIcon />
                </IconButton>
              </div>

              {ex.subexercises.map((_, subIdx) => (
                <div
                  key={`sub-ex-${subIdx}`}
                  className={clsx(classes.exercise, classes.subexercise)}
                >
                  <FormikTextField
                    name={`${name}.${idx}.subexercises.${subIdx}.exName`}
                    label='Aufgabenname'
                    // type='number'
                    fullWidth={false}
                    // inputProps={{ min: 0, step: 1 }}
                  />

                  {/* TODO: Add more fields - abstract the previous fields into subcomponent. */}
                </div>
              ))}
            </>
          ))}

          <Button
            className={classes.addButton}
            color='secondary'
            size='large'
            onClick={() =>
              arrayHelpers.push({
                exNo: exercises.length + 1,
                maxPoints: 0.0,
                bonus: false,
              })
            }
          >
            <PlusIcon className={classes.iconInButton} />
            Neue Aufgabe hinzufügen
          </Button>

          <ErrorMessage component='div' name={name} className={classes.errorMessage} />
        </div>
      )}
    />
  );
}

export default FormikExerciseEditor;
