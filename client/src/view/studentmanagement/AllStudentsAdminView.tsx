import { Theme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { format } from 'date-fns';
import fastcsv from 'fast-csv';
import { Row, RowMap } from 'fast-csv/build/src/parser';
import FileSaver from 'file-saver';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { Attendance } from 'shared/dist/model/Attendance';
import { PointMap } from 'shared/dist/model/Points';
import { ScheinCriteriaSummary } from 'shared/dist/model/ScheinCriteria';
import { Tutorial } from 'shared/dist/model/Tutorial';
import SubmitButton from '../../components/loading/SubmitButton';
import { getScheinStatusPDF } from '../../hooks/fetching/Files';
import { getAllScheinExams } from '../../hooks/fetching/ScheinExam';
import { getAllSheets } from '../../hooks/fetching/Sheet';
import { getScheinCriteriaSummaryOfAllStudents } from '../../hooks/fetching/Student';
import { getAllTutorials } from '../../hooks/fetching/Tutorial';
import {
  getSumOfPointsOfStudentInScheinExam,
  parseDateToMapKey,
  saveBlob,
} from '../../util/helperFunctions';
import { getPointsOfEntityAsString } from '../points-sheet/util/helper';
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
  const [summaries, setSummaries] = useState<{ [studentId: string]: ScheinCriteriaSummary }>({});

  const [{ students }] = useStudentStore();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    getScheinCriteriaSummaryOfAllStudents()
      .then(response => setSummaries(response))
      .catch(() =>
        enqueueSnackbar('Konnte Ergebnisse der Scheinkriterien nicht abrufen.', {
          variant: 'error',
        })
      );

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

  async function generateCSVFile() {
    setCreatingCSVFile(true);
    const dataArray: Row[] = [];

    for (const {
      id,
      lastname,
      firstname,
      matriculationNo,
      presentationPoints,
      scheinExamResults,
      attendance,
      points,
    } of students) {
      const criteriaResult = summaries[id];
      const exams = await getAllScheinExams();
      const sheets = await getAllSheets();
      const pointsOfStudent = new PointMap(points);

      const data: RowMap = {
        lastname,
        firstname,
        matriculationNo: matriculationNo || 'NA',
        scheinPassed: criteriaResult.passed + '',
        presentations: Object.values(presentationPoints)
          .reduce((prev, current) => prev + current, 0)
          .toString(),
      };

      for (const sheet of sheets) {
        const maxPoints = getPointsOfEntityAsString(sheet);
        const sheetResult = pointsOfStudent.getSumOfPoints(sheet);
        data[`sheet-${sheet.sheetNo}`] = `${sheetResult}/${maxPoints}`;
      }

      for (const date of Object.values(attendance).map(at => at.date)) {
        const attendanceOfDate: Attendance = attendance[parseDateToMapKey(new Date(date))];
        data[`date-${format(new Date(date), 'yyyy-MM-dd')}`] = attendanceOfDate.state || '';
      }

      for (const exam of exams) {
        const scheinExamResult = getSumOfPointsOfStudentInScheinExam(scheinExamResults, exam);
        data[`exam-${exam.scheinExamNo}`] = scheinExamResult.toString();
      }
      dataArray.push(data);
    }

    const csvData: string = await fastcsv.writeToString(dataArray, { headers: true });
    const csvBlob = new Blob([csvData], { type: 'text/csv' });

    FileSaver.saveAs(csvBlob, 'tms_export.csv');

    setCreatingCSVFile(false);
  }

  return (
    <Studentoverview
      summaries={summaries}
      tutorials={tutorials}
      allowChangeTutorial
      additionalTopBarItem={
        <div className={classes.topBar}>
          <SubmitButton
            variant='contained'
            color='primary'
            isSubmitting={isCreatingScheinStatus}
            className={classes.printButton}
            onClick={printOverviewSheet}
            disabled={students.length === 0}
          >
            Scheinliste ausdrucken
          </SubmitButton>

          <SubmitButton
            variant='contained'
            color='primary'
            className={classes.printButton}
            onClick={generateCSVFile}
            isSubmitting={isCreatingCSVFile}
            disabled={students.length === 0}
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
