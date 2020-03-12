import { Box, IconButton, TableCell, TextField, Typography } from '@material-ui/core';
import { ContentSave as SaveIcon } from 'mdi-material-ui';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import PaperTableRow from '../../components/PaperTableRow';
import Placeholder from '../../components/Placeholder';
import { useSheetSelector } from '../../components/sheet-selector/SheetSelector';
import StudentAvatar from '../../components/student-icon/StudentAvatar';
import TableWithPadding from '../../components/TableWithPadding';
import { getStudentsOfTutorial } from '../../hooks/fetching/Tutorial';
import { useErrorSnackbar } from '../../hooks/useErrorSnackbar';
import { Student } from '../../model/Student';
import { getPresentationPointsPath } from '../../routes/Routing.helpers';
import FormikBaseForm from '../../components/forms/FormikBaseForm';
import { Formik } from 'formik';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import FormikTextField from '../../components/forms/components/FormikTextField';
import FormikDebugDisplay from '../../components/forms/components/FormikDebugDisplay';
import { Sheet } from '../../model/Sheet';
import PointsTextField from '../../components/PointsTextField';
import SubmitButton from '../../components/loading/SubmitButton';

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

interface RouteParams {
  sheetId?: string;
  tutorialId?: string;
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

function PresentationPoints(): JSX.Element {
  const classes = useStyles();

  const { tutorialId } = useParams<RouteParams>();
  const { setError } = useErrorSnackbar();
  const { SheetSelector, currentSheet, isLoadingSheets } = useSheetSelector({
    generatePath: ({ sheetId }) => {
      if (!tutorialId) {
        throw new Error('The path needs to contain a tutorialId parameter.');
      }

      return getPresentationPointsPath({ tutorialId, sheetId });
    },
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if (!tutorialId) {
      setError('Es wurde keine Tutoriums ID über den Pfad mitgegeben.');

      return;
    }

    setLoading(true);

    getStudentsOfTutorial(tutorialId)
      .then(students => {
        setStudents(students);
      })
      .catch(() => setError('Studierende konnte nicht abgerufen werden.'))
      .finally(() => setLoading(false));
  }, [tutorialId, setError]);

  return (
    <Box display='flex' flexDirection='column'>
      <Box display='flex' marginBottom={2} alignItems='center'>
        <SheetSelector />
      </Box>

      <Placeholder
        placeholderText='Kein Blatt ausgewählt'
        showPlaceholder={!currentSheet}
        loading={isLoading || isLoadingSheets}
      >
        {currentSheet && (
          <Formik initialValues={generateInitialState(students, currentSheet)} onSubmit={() => {}}>
            {({ handleSubmit, values, isSubmitting }) => (
              <form onSubmit={handleSubmit}>
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

                      <TableCell align='right'>
                        <SubmitButton
                          isSubmitting={isSubmitting}
                          variant='outlined'
                          color='secondary'
                          startIcon={<SaveIcon />}
                        >
                          Speichern
                        </SubmitButton>
                      </TableCell>
                    </PaperTableRow>
                  )}
                />

                <FormikDebugDisplay values={values} />
              </form>
            )}
          </Formik>
        )}
      </Placeholder>
    </Box>
  );
}

export default PresentationPoints;
