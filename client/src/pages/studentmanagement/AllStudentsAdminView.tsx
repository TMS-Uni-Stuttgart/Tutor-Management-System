import { Theme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import React, { useCallback, useState } from 'react';
import TutorialChangeForm from '../../components/forms/TutorialChangeForm';
import LoadingSpinner from '../../components/loading/LoadingSpinner';
import SubmitButton from '../../components/loading/SubmitButton';
import SplitButton from '../../components/SplitButton';
import { useDialog } from '../../hooks/dialog-service/DialogService';
import { getClearScheinStatusPDF, getScheinStatusPDF } from '../../hooks/fetching/Files';
import { Student } from '../../model/Student';
import { saveBlob } from '../../util/helperFunctions';
import StudentList from './student-overview-new/StudentList';
import { useStudentsForStudentList } from './student-overview-new/StudentList.helpers';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    printButton: {
      marginLeft: theme.spacing(1.5),
      height: '56px',
    },
    topBar: {
      justifySelf: 'flex-end',
    },
  })
);

function AdminStudentManagement(): JSX.Element {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const dialog = useDialog();

  const [isCreatingCSVFile, setCreatingCSVFile] = useState(false);
  const [isCreatingScheinStatus, setCreatingScheinStatus] = useState(false);

  const {
    students,
    teams,
    summaries,
    isLoading,
    editStudent,
    deleteStudent,
    changeTutorialOfStudent,
  } = useStudentsForStudentList({});

  const handleChangeTutorial = useCallback(
    (student: Student) => {
      dialog.show({
        title: 'In folgendes Tutorium wechseln',
        content: (
          <TutorialChangeForm
            tutorial={student.tutorial}
            onSubmit={async ({ tutorial }) => {
              await changeTutorialOfStudent(student, tutorial);
              dialog.hide();
            }}
            onCancel={() => dialog.hide()}
          />
        ),
      });
    },
    [changeTutorialOfStudent, dialog]
  );

  const printOverviewSheet = useCallback(async () => {
    setCreatingScheinStatus(true);

    try {
      const blob = await getScheinStatusPDF();

      saveBlob(blob, 'Scheinübersichtsliste.pdf');
    } catch {
      enqueueSnackbar('Scheinübersichtsliste konnte nicht erstellt werden', { variant: 'error' });
    } finally {
      setCreatingScheinStatus(false);
    }
  }, [enqueueSnackbar]);

  const printUnshortenedOverviewSheet = useCallback(async () => {
    setCreatingScheinStatus(true);

    try {
      const blob = await getClearScheinStatusPDF();

      saveBlob(blob, 'Scheinübersichtsliste_ungekürzt.pdf');
    } catch {
      enqueueSnackbar('Scheinübersichtsliste konnte nicht erstellt werden', { variant: 'error' });
    } finally {
      setCreatingScheinStatus(false);
    }
  }, [enqueueSnackbar]);

  const generateCSVFile = useCallback(async () => {
    // TODO: Move this to the server.
    enqueueSnackbar('CSV-Export wird aktuell nicht unterstützt', { variant: 'error' });
  }, [enqueueSnackbar]);

  return isLoading ? (
    <LoadingSpinner text='Lade Studierende' />
  ) : (
    <StudentList
      students={students}
      summaries={summaries}
      teams={teams}
      onStudentEdit={editStudent}
      onStudentDelete={deleteStudent}
      onStudentChangeTutorial={handleChangeTutorial}
      studentSubtextType='tutorial'
      additionalTopBarItem={
        <div className={classes.topBar}>
          <SplitButton
            variant='contained'
            color='primary'
            className={classes.printButton}
            disabled={!students || students.length === 0 || isCreatingScheinStatus}
            options={[
              {
                label: 'Scheinliste ausdrucken',
                ButtonProps: {
                  onClick: printOverviewSheet,
                },
              },
              {
                label: 'Ungek. Liste ausdrucken',
                ButtonProps: {
                  onClick: printUnshortenedOverviewSheet,
                },
              },
            ]}
          />

          <SubmitButton
            variant='contained'
            color='primary'
            className={classes.printButton}
            onClick={generateCSVFile}
            isSubmitting={isCreatingCSVFile}
            disabled
            // disabled={students.length === 0}
          >
            CSV Datei
          </SubmitButton>
        </div>
      }
    />
  );
}

function AllStudentsAdminView(): JSX.Element {
  return <AdminStudentManagement />;
}

export default AllStudentsAdminView;
