import { Button, IconButton } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { ErrorMessage, FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { MinusBox as MinusIcon, PlusBox as PlusIcon } from 'mdi-material-ui';
import React from 'react';
import { Exercise } from 'shared/dist/model/Sheet';
import { SheetFormExercise } from '../SheetForm';
import FormikCheckbox from './FormikCheckbox';
import FormikTextField from './FormikTextField';

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

interface ExerciseDataFieldsProps {
  namePrefix: string;
}

function ExerciseDataFields({ namePrefix }: ExerciseDataFieldsProps): JSX.Element {
  return (
    <>
      <FormikTextField
        name={`${namePrefix}.exName`}
        label='Aufgabenbezeichnung'
        // type='number'
        fullWidth={false}
        // inputProps={{ min: 0, step: 1 }}
      />

      <FormikTextField
        name={`${namePrefix}.maxPoints`}
        label='Punkte'
        type='number'
        fullWidth={false}
        inputProps={{ min: 0, step: 0.1 }}
      />

      <FormikCheckbox name={`${namePrefix}.bonus`} label='Bonusaufgabe' />
    </>
  );
}

function FormikExerciseEditor({ name }: Props): JSX.Element {
  const classes = useStyles();
  const { values } = useFormikContext();

  const exercises: Exercise[] = values[name] || [];

  function handleCreateExercise(arrayHelpers: FieldArrayRenderProps) {
    return () => {
      const exercise: SheetFormExercise = {
        exName: (exercises.length + 1).toString(),
        maxPoints: '0.0',
        bonus: false,
        subexercises: [
          // FIXME: REMOVE ME!!
          {
            exName: 'a)',
            maxPoints: '0.0',
            bonus: false,
            subexercises: [],
          },
          {
            exName: 'b)',
            maxPoints: '0.0',
            bonus: false,
            subexercises: [],
          },
        ],
      };

      arrayHelpers.push(exercise);
    };
  }

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
            <React.Fragment key={idx}>
              <div className={classes.exercise}>
                <ExerciseDataFields namePrefix={`${name}.${idx}`} />
                {/* <FormikTextField
                  name={`${name}.${idx}.exName`}
                  label='Aufgabenbezeichnung'
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

                <FormikCheckbox name={`${name}.${idx}.bonus`} label='Bonusaufgabe' /> */}

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
                  <ExerciseDataFields namePrefix={`${name}.${idx}.subexercises.${subIdx}`} />

                  <IconButton
                    className={classes.deleteButton}
                    onClick={() => console.log('REMOVE SUB EXERCISE!')}
                  >
                    <MinusIcon />
                  </IconButton>
                </div>
              ))}
            </React.Fragment>
          ))}

          <Button
            className={classes.addButton}
            color='secondary'
            size='large'
            onClick={handleCreateExercise(arrayHelpers)}
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
