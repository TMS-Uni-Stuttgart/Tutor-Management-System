import { Theme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import SubmitButton from '../../components/loading/SubmitButton';
import SplitButton from '../../components/SplitButton';
import { getClearScheinStatusPDF, getScheinStatusPDF } from '../../hooks/fetching/Files';
import { getAllTutorials } from '../../hooks/fetching/Tutorial';
import { Tutorial } from '../../model/Tutorial';
import { saveBlob } from '../../util/helperFunctions';
import Studentoverview from './student-overview/Studentoverview';
import StudentoverviewStoreProvider, { useStudentStore } from './student-store/StudentStore';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '100%',
      position: 'relative',
    },
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

  const [isCreatingCSVFile, setCreatingCSVFile] = useState(false);
  const [isCreatingScheinStatus, setCreatingScheinStatus] = useState(false);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);

  const [{ students }] = useStudentStore();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    getAllTutorials().then(response => setTutorials(response));
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

  // TODO: Move this to the server.
  async function generateCSVFile() {
    enqueueSnackbar('CSV-Export wird aktuell nicht unterstützt', { variant: 'error' });
    // setCreatingCSVFile(true);

    // const dataArray: Row[] = [];
    // const [summaries, sheets, exams] = await Promise.all([
    //   getScheinCriteriaSummaryOfAllStudents(),
    //   getAllSheets(),
    //   getAllScheinExams(),
    // ]);

    // for (const student of students) {
    //   const { id, lastname, firstname, matriculationNo } = student;
    //   const criteriaResult = summaries[id];
    //   const presentations: string = student.getPresentationPointsSum().toString();

    //   const data: RowMap = {
    //     lastname,
    //     firstname,
    //     matriculationNo: matriculationNo || 'NA',
    //     scheinPassed: criteriaResult.passed + '',
    //     presentations,
    //   };

    //   for (const sheet of sheets) {
    //     const maxPoints = getPointsOfEntityAsString(sheet);
    //     const sheetResult = student.getGrading(sheet)?.totalPoints ?? 0;
    //     data[`sheet-${sheet.sheetNo}`] = `${sheetResult}/${maxPoints}`;
    //   }

    //   for (const [date, attendance] of student.attendances) {
    //     data[`date-${DateTime.fromISO(date).toFormat('yyyy-MM-dd')}`] = attendance.state || '';
    //   }

    //   for (const exam of exams) {
    //     const scheinExamResult: number = student.getGrading(exam)?.totalPoints ?? 0;
    //     data[`exam-${exam.scheinExamNo}`] = scheinExamResult.toString();
    //   }
    //   dataArray.push(data);
    // }

    // const csvData: string = await fastcsv.writeToString(dataArray, { headers: true });
    // const csvBlob = new Blob([csvData], { type: 'text/csv' });

    // FileSaver.saveAs(csvBlob, 'tms_export.csv');

    // setCreatingCSVFile(false);
  }

  return (
    <Studentoverview
      tutorials={tutorials}
      allowChangeTutorial
      additionalTopBarItem={
        <div className={classes.topBar}>
          <SplitButton
            variant='contained'
            color='primary'
            className={classes.printButton}
            disabled={students.length === 0 || isCreatingScheinStatus}
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
  const classes = useStyles();

  return (
    <StudentoverviewStoreProvider>
      <div className={classes.root}>
        <AdminStudentManagement />
      </div>
    </StudentoverviewStoreProvider>
  );
}

export default AllStudentsAdminView;
