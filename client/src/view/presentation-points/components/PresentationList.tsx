import { createStyles, makeStyles, TableCell, Typography } from '@material-ui/core';
import { FormikHelpers, isPromise } from 'formik';
import React, { useState } from 'react';
import { Prompt } from 'react-router';
import FormikTextField from '../../../components/forms/components/FormikTextField';
import FormikBaseForm from '../../../components/forms/FormikBaseForm';
import PaperTableRow from '../../../components/PaperTableRow';
import StudentAvatar from '../../../components/student-icon/StudentAvatar';
import TableWithPadding from '../../../components/TableWithPadding';
import { Sheet } from '../../../model/Sheet';
import { Student } from '../../../model/Student';

const useStyles = makeStyles(theme =>
  createStyles({
    textField: {
      width: '100%',
    },
    input: {
      width: 'unset',
      flex: 1,
      textAlign: 'right',
    },
  })
);

interface SubmitParams {
  student: Student;
  values: FormikState;
  helpers: FormikHelpers<FormikState>;
}

type SubmitFunction = (student: Student, points: number) => void | Promise<any>;

interface Props {
  students: Student[];
  sheet: Sheet;
  onSubmit: SubmitFunction;
}

interface FormikState {
  [studentId: string]: string;
}

function generateInitialState(students: Student[], sheet: Sheet): FormikState {
  const state: FormikState = {};

  students.forEach(student => {
    const points = student.getPresentationPoints(sheet);

    state[student.id] = points?.toString() ?? '0';
  });

  return state;
}

function PresentationList({ students, sheet, onSubmit }: Props): JSX.Element {
  const classes = useStyles();
  const [initialState, setInitialState] = useState<FormikState>(
    generateInitialState(students, sheet)
  );

  async function handleFormikSubmit(values: FormikState, helpers: FormikHelpers<FormikState>) {
    const promises: Promise<void>[] = [];

    students.forEach(student => {
      const key = student.id;

      if (values[key] !== initialState[key]) {
        const callback = onSubmit(student, Number.parseInt(values[key]));

        if (isPromise(callback)) {
          promises.push(callback);
        }
      }
    });

    await Promise.all(promises);

    setInitialState(values);
    helpers.resetForm({ values });
  }

  return (
    <FormikBaseForm initialValues={initialState} onSubmit={handleFormikSubmit} enableDebug>
      {({ dirty }) => (
        <>
          <TableWithPadding
            items={students}
            createRowFromItem={student => (
              <PaperTableRow
                key={student.id}
                label={student.name}
                Avatar={<StudentAvatar student={student} />}
              >
                <TableCell align='left'>
                  <Typography>Insgesamt: {student.getPresentationPointsSum()}</Typography>
                </TableCell>

                <TableCell align='right'>
                  <FormikTextField
                    name={student.id}
                    className={classes.textField}
                    type='number'
                    inputProps={{ min: 0, steps: 1, className: classes.input }}
                    size='small'
                  />
                </TableCell>

                {/* <TableCell align='right'>
              <SubmitButton
              isSubmitting={isSubmitting}
              variant='outlined'
              color='secondary'
              startIcon={<SaveIcon />}
              >
              Speichern
              </SubmitButton>
            </TableCell> */}
              </PaperTableRow>
            )}
          />

          <Prompt
            message='Es gibt ungespeicherte Änderungen. Soll die Seite wirklich verlassen werden?'
            when={dirty}
          />
        </>
      )}
    </FormikBaseForm>
  );
}

export default PresentationList;
