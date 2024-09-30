import { TableCell, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { FormikErrors, FormikHelpers, isPromise } from 'formik';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import FormikTextField from '../../../components/forms/components/FormikTextField';
import FormikBaseForm from '../../../components/forms/FormikBaseForm';
import PaperTableRow from '../../../components/PaperTableRow';
import StudentAvatar from '../../../components/student-icon/StudentAvatar';
import TableWithPadding from '../../../components/TableWithPadding';
import { Sheet } from '../../../model/Sheet';
import { Student } from '../../../model/Student';

const useStyles = makeStyles((theme) =>
  createStyles({
    form: {
      overflowY: 'auto',
      gridTemplateColumns: '1fr',
      gridTemplateRows: 'auto 1fr',
    },
    tableWrapper: {
      marginRight: theme.spacing(-1),
      paddingRight: theme.spacing(0.5),
      overflowY: 'auto',
    },
    table: {
      marginBottom: 0,
    },
    textField: {
      width: '60%',
    },
    input: {
      flex: 1,
      textAlign: 'right',
    },
    labelCell: {
      // Style cell of name to not take up more space than neccessary
      width: '1%',
      whiteSpace: 'nowrap',
    },
  })
);

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

  students.forEach((student) => {
    const points = student.getPresentationPoints(sheet);

    state[student.id] = points?.toString() ?? '0';
  });

  return state;
}

function validateState(state: FormikState): FormikErrors<FormikState> {
  const errors: FormikErrors<FormikState> = {};

  Object.entries(state).forEach(([key, value]) => {
    const parsed = Number.parseFloat(value);

    if (Number.isNaN(parsed) || !Number.isInteger(parsed) || parsed < 0) {
      errors[key] = 'Muss eine positive ganze Zahl sein.';
    }
  });

  return errors;
}

function PresentationList({ students, sheet, onSubmit }: Props): JSX.Element {
  const classes = useStyles();
  const [initialState, setInitialState] = useState<FormikState>(
    generateInitialState(students, sheet)
  );
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setInitialState(generateInitialState(students, sheet));
  }, [students, sheet]);

  async function handleFormikSubmit(values: FormikState, helpers: FormikHelpers<FormikState>) {
    const promises: Promise<void>[] = [];

    students.forEach((student) => {
      const key = student.id;

      if (values[key] !== initialState[key]) {
        const callback = onSubmit(student, Number.parseInt(values[key]));

        if (isPromise(callback)) {
          promises.push(callback);
        }
      }
    });

    try {
      await Promise.all(promises);

      setInitialState(values);
      helpers.resetForm({ values });

      enqueueSnackbar('Präsentationspunkte erfolgreich eingetragen.', { variant: 'success' });
    } catch {
      enqueueSnackbar('Präsentationspunkte eingetragen fehlgeschlagen.', {
        variant: 'error',
      });
    }
  }

  return (
    <FormikBaseForm
      className={classes.form}
      initialValues={initialState}
      onSubmit={handleFormikSubmit}
      onCancelClicked={({ resetForm }) => resetForm()}
      validate={validateState}
      enableReinitialize
      enableUnsavedChangesWarning
      disableSubmitButtonIfClean
      enableDebug
    >
      {({ dirty }) => {
        // unstable_usePrompt({
        //   message: 'Es gibt ungespeicherte Änderungen. Soll die Seite wirklich verlassen werden?',
        //   when: dirty,
        // });

        return (
          <div className={classes.tableWrapper}>
            <TableWithPadding
              items={students}
              className={classes.table}
              BoxProps={{ marginTop: 2 }}
              createRowFromItem={(student) => (
                <PaperTableRow
                  key={student.id}
                  label={student.name}
                  Avatar={<StudentAvatar student={student} />}
                  LabelCellProps={{ className: classes.labelCell }}
                >
                  <TableCell align='right'>
                    <Typography>Insgesamt: {student.getPresentationPointsSum()}</Typography>
                  </TableCell>

                  <TableCell align='right'>
                    <FormikTextField
                      name={student.id}
                      className={classes.textField}
                      type='number'
                      inputProps={{ className: classes.input }}
                      size='small'
                    />
                  </TableCell>
                </PaperTableRow>
              )}
            />
          </div>
        );
      }}
    </FormikBaseForm>
  );
}

export default PresentationList;
