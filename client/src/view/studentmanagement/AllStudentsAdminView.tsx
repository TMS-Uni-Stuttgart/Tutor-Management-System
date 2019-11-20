import { TextField, Theme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import { format } from 'date-fns';
import fastcsv from 'fast-csv';
import { Row, RowMap } from 'fast-csv/build/src/parser';
import FileSaver from 'file-saver';
import { AccountSearch as SearchIcon } from 'mdi-material-ui';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import React, { useEffect, useState } from 'react';
import { Attendance } from 'shared/dist/model/Attendance';
import { PointMap } from 'shared/dist/model/Points';
import { ScheinCriteriaSummary } from 'shared/dist/model/ScheinCriteria';
import { StudentDTO, StudentStatus } from 'shared/dist/model/Student';
import { Tutorial } from 'shared/dist/model/Tutorial';
import SubmitButton from '../../components/forms/components/SubmitButton';
import StudentForm, { StudentFormSubmitCallback } from '../../components/forms/StudentForm';
import TutorialChangeForm, {
  TutorialChangeFormSubmitCallback,
} from '../../components/forms/TutorialChangeForm';
import LoadingSpinner from '../../components/LoadingSpinner';
import TableWithPadding from '../../components/TableWithPadding';
import { useDialog } from '../../hooks/DialogService';
import { getAllSheets } from '../../hooks/fetching/Sheet';
import { useAxios } from '../../hooks/FetchingService';
import { StudentWithFetchedTeam } from '../../typings/types';
import {
  getSumOfPointsOfStudentInScheinExam,
  parseDateToMapKey,
  saveBlob,
} from '../../util/helperFunctions';
import ExtendableStudentRow from '../management/components/ExtendableStudentRow';
import { getPointsOfEntityAsString } from '../pointsmanagement/util/helper';
import { getFilteredStudents } from './Studentmanagement';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '100%',
      position: 'relative',
    },
    dialogDeleteButton: {
      color: theme.palette.error.main,
    },
    printButton: {
      marginRight: theme.spacing(2),
      height: '56px',
    },
    topBar: {
      display: 'flex',
      justifyContent: 'flex-end',
    },
    searchField: {
      flex: 1,
      marginRight: theme.spacing(2),
    },
  })
);

type PropType = WithSnackbarProps;

function AllStudentsAdminView({ enqueueSnackbar }: PropType): JSX.Element {
  const classes = useStyles();

  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingCSVFile, setCreatingCSVFile] = useState(false);
  const [isCreatingScheinStatus, setCreatingScheinStatus] = useState(false);

  const [students, setStudents] = useState<StudentWithFetchedTeam[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [summaries, setSummaries] = useState<{ [studentId: string]: ScheinCriteriaSummary }>({});

  const [filterText, setFilterText] = useState<string>('');

  const {
    editStudent: editStudentRequest,
    deleteStudent: deleteStudentRequest,
    getAllStudents,
    getAllScheinExams,
    getAllTutorials,
    getScheinCriteriaSummaryOfAllStudents,
    getScheinStatusPDF,
  } = useAxios();
  const dialog = useDialog();

  useEffect(() => {
    setIsLoading(true);
    getAllStudents().then(response => {
      setStudents(response);
      setIsLoading(false);
    });

    getScheinCriteriaSummaryOfAllStudents()
      .then(response => setSummaries(response))
      .catch(() =>
        enqueueSnackbar('Konnte Ergebnisse der Scheinkriterien nicht abrufen.', {
          variant: 'error',
        })
      );

    getAllTutorials().then(response => setTutorials(response));
  }, [getAllStudents, getAllTutorials, getScheinCriteriaSummaryOfAllStudents, enqueueSnackbar]);

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

  const editStudent: (student: StudentWithFetchedTeam) => StudentFormSubmitCallback = student => (
    { firstname, lastname, matriculationNo, email, courseOfStudies, team },
    { setSubmitting }
  ) => {
    const studentDTO: StudentDTO = {
      lastname,
      firstname,
      matriculationNo: matriculationNo.toString(),
      email,
      courseOfStudies,
      tutorial: student.tutorial,
      team: !team ? undefined : team,
      status: StudentStatus.ACTIVE,
    };

    editStudentRequest(student.id, studentDTO)
      .then(response => {
        setStudents(
          students.map(stud => {
            if (stud.id === student.id) {
              return response;
            }

            return stud;
          })
        );

        enqueueSnackbar('Student wurde erfolgreich gespeichert.', { variant: 'success' });
        dialog.hide();
      })
      .catch(reason => {
        console.error(reason);
        enqueueSnackbar('Student konnte nicht gespeichert werden.', { variant: 'error' });
        setSubmitting(false);
      });
  };

  function handleDeleteStudent(student: StudentWithFetchedTeam) {
    const nameOfStudent = `${student.firstname} ${student.lastname}`;
    dialog.show({
      title: 'Nutzer löschen',
      content: `Soll der Student "${nameOfStudent}" wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden!`,
      actions: [
        {
          label: 'Nicht löschen',
          onClick: () => dialog.hide(),
        },
        {
          label: 'Löschen',
          onClick: () => deleteStudent(student),
          buttonProps: {
            className: classes.dialogDeleteButton,
          },
        },
      ],
    });
  }

  function handleEditStudent(student: StudentWithFetchedTeam) {
    dialog.show({
      title: 'Nutzer bearbeiten',
      content: (
        <StudentForm
          student={student}
          otherStudents={students.filter(s => s.id !== student.id)}
          teams={undefined}
          onSubmit={editStudent(student)}
          onCancelClicked={() => dialog.hide()}
        />
      ),
      DialogProps: {
        maxWidth: 'lg',
      },
    });
  }

  function deleteStudent(student: StudentWithFetchedTeam) {
    deleteStudentRequest(student.id)
      .then(() => {
        setStudents(students.filter(u => u.id !== student.id));
        enqueueSnackbar('Student wurde erfolgreich gelöscht.', { variant: 'success' });
      })
      .finally(() => dialog.hide());
  }

  function handleChangeTutorial(student: StudentWithFetchedTeam) {
    dialog.show({
      title: 'In folgendes Tutorium wechseln',
      content: (
        <TutorialChangeForm
          allTutorials={tutorials}
          tutorial={student.tutorial}
          onSubmit={onChangeTutorial(student)}
          onCancel={() => dialog.hide()}
        />
      ),
    });
  }

  function onChangeTutorial(student: StudentWithFetchedTeam): TutorialChangeFormSubmitCallback {
    return async ({ tutorial }) => {
      if (tutorial === student.tutorial) {
        return;
      }

      const response = await editStudentRequest(student.id, {
        ...student,
        team: student.team ? student.team.id : undefined,
        tutorial,
      });

      setStudents(
        students.map(s => {
          if (s.id === response.id) {
            return response;
          }

          return s;
        })
      );
      dialog.hide();
    };
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
    <div className={classes.root}>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className={classes.topBar}>
            <TextField
              variant='outlined'
              label='Suche'
              onChange={e => setFilterText(e.target.value)}
              className={classes.searchField}
              InputProps={{
                startAdornment: <SearchIcon color='disabled' />,
              }}
            />

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

          <TableWithPadding
            placeholder='Keine Studierenden vorhanden'
            items={getFilteredStudents(students, filterText)}
            createRowFromItem={student => (
              <ExtendableStudentRow
                student={student}
                showTutorial
                tutorials={tutorials}
                summary={summaries[student.id]}
                onEditStudentClicked={handleEditStudent}
                onDeleteStudentClicked={handleDeleteStudent}
                onChangeTutorialClicked={handleChangeTutorial}
              />
            )}
          />
        </>
      )}
    </div>
  );
}

export default withSnackbar(AllStudentsAdminView);
