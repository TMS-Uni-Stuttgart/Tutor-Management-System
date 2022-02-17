import { Theme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import React, { useCallback, useState } from 'react';
import LoadingSpinner from '../../components/loading/LoadingSpinner';
import SubmitButton from '../../components/loading/SubmitButton';
import SplitButton from '../../components/SplitButton';
import { useDialog } from '../../hooks/dialog-service/DialogService';
import {
  getClearScheinStatusPDF,
  getScheinStatusPDF,
  getScheinStatusXLSX,
} from '../../hooks/fetching/Files';
import { Student } from '../../model/Student';
import { saveBlob } from '../../util/helperFunctions';
import TutorialChangeForm from './student-list/components/TutorialChangeForm';
import StudentList from './student-list/StudentList';
import { useStudentsForStudentList } from './student-list/StudentList.helpers';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    printButton: {
      marginLeft: theme.spacing(1.5),
      height: '56px',
    },
  })
);

function AdminStudentManagement(): JSX.Element {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const dialog = useDialog();

  const [isCreatingXlsxFile, setCreatingXlsxFile] = useState(false);
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
      enqueueSnackbar('Scheinübersichtsliste konnte nicht erstellt werden', {
        variant: 'error',
      });
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
      enqueueSnackbar('Scheinübersichtsliste konnte nicht erstellt werden', {
        variant: 'error',
      });
    } finally {
      setCreatingScheinStatus(false);
    }
  }, [enqueueSnackbar]);

  const generateCSVFile = useCallback(async () => {
    setCreatingXlsxFile(true);

    try {
      const blob = await getScheinStatusXLSX();

      saveBlob(blob, 'Scheinübersichtsliste.xlsx');
    } catch {
      enqueueSnackbar('Scheinübersichtsliste konnte nicht erstellt werden', {
        variant: 'error',
      });
    } finally {
      setCreatingXlsxFile(false);
    }
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
        <>
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
            isSubmitting={isCreatingXlsxFile}
            disabled={students.length === 0}
          >
            XLSX Datei
          </SubmitButton>
        </>
      }
    />
  );
}

function AllStudentsAdminView(): JSX.Element {
  return <AdminStudentManagement />;
}

export default AllStudentsAdminView;
