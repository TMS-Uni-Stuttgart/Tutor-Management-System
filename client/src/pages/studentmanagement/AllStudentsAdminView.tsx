import { Theme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/loading/LoadingSpinner';
import SubmitButton from '../../components/loading/SubmitButton';
import SplitButton from '../../components/SplitButton';
import { getClearScheinStatusPDF, getScheinStatusPDF } from '../../hooks/fetching/Files';
import { getAllTutorials } from '../../hooks/fetching/Tutorial';
import { Tutorial } from '../../model/Tutorial';
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

  const [isCreatingCSVFile, setCreatingCSVFile] = useState(false);
  const [isCreatingScheinStatus, setCreatingScheinStatus] = useState(false);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);

  const { students, summaries, isLoading } = useStudentsForStudentList({});

  useEffect(() => {
    getAllTutorials().then((response) => setTutorials(response));
  }, [enqueueSnackbar]);

  async function printOverviewSheet() {
    setCreatingScheinStatus(true);

    try {
      const blob = await getScheinStatusPDF();

      saveBlob(blob, 'Scheinübersichtsliste.pdf');
    } catch {
      enqueueSnackbar('Scheinübersichtsliste konnte nicht erstellt werden', { variant: 'error' });
    } finally {
      setCreatingScheinStatus(false);
    }
  }

  async function printUnshortenedOverviewSheet() {
    setCreatingScheinStatus(true);

    try {
      const blob = await getClearScheinStatusPDF();

      saveBlob(blob, 'Scheinübersichtsliste_ungekürzt.pdf');
    } catch {
      enqueueSnackbar('Scheinübersichtsliste konnte nicht erstellt werden', { variant: 'error' });
    } finally {
      setCreatingScheinStatus(false);
    }
  }

  async function generateCSVFile() {
    // TODO: Move this to the server.
    enqueueSnackbar('CSV-Export wird aktuell nicht unterstützt', { variant: 'error' });
  }

  return isLoading ? (
    <LoadingSpinner text='Lade Studierende' />
  ) : (
    <StudentList
      students={students ?? []}
      studentSubtextType='tutorial'
      summaries={summaries ?? {}}
      onStudentEdit={() => {}}
      onStudentDelete={() => {}}
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
  // <Studentoverview
  //   tutorials={tutorials}
  //   allowChangeTutorial
  //   showTutorialOnStudentBar
  //   additionalTopBarItem={
  //     <div className={classes.topBar}>
  //       <SplitButton
  //         variant='contained'
  //         color='primary'
  //         className={classes.printButton}
  //         disabled={students.length === 0 || isCreatingScheinStatus}
  //         options={[
  //           {
  //             label: 'Scheinliste ausdrucken',
  //             ButtonProps: {
  //               onClick: printOverviewSheet,
  //             },
  //           },
  //           {
  //             label: 'Ungek. Liste ausdrucken',
  //             ButtonProps: {
  //               onClick: printUnshortenedOverviewSheet,
  //             },
  //           },
  //         ]}
  //       />

  //       <SubmitButton
  //         variant='contained'
  //         color='primary'
  //         className={classes.printButton}
  //         onClick={generateCSVFile}
  //         isSubmitting={isCreatingCSVFile}
  //         disabled
  //         // disabled={students.length === 0}
  //       >
  //         CSV Datei
  //       </SubmitButton>
  //     </div>
  //   }
  // />
}

function AllStudentsAdminView(): JSX.Element {
  return <AdminStudentManagement />;
}

export default AllStudentsAdminView;
