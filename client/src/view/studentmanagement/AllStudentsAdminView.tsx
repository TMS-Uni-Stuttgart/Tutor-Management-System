import { Button, Theme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import { format } from 'date-fns';
import fastcsv from 'fast-csv';
import { Row, RowMap } from 'fast-csv/build/src/parser';
import FileSaver from 'file-saver';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import printJS from 'print-js';
import React, { useEffect, useState } from 'react';
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
import { StudentDTO } from '../../typings/RequestDTOs';
import { Attendance, Tutorial, ScheinCriteriaSummary } from '../../typings/ServerResponses';
import { StudentWithFetchedTeam } from '../../typings/types';
import { getSumOfPointsOfStudentInScheinExam, parseDateToMapKey } from '../../util/helperFunctions';
import ExtendableStudentRow from '../management/components/ExtendableStudentRow';
import {
  getPointsOfEntityAsString,
  getPointsOfStudentOfSheet,
} from '../pointsmanagement/util/helper';

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
      marginRight: theme.spacing(1),
      height: '56px',
    },
    topBar: {
      display: 'flex',
      justifyContent: 'flex-end',
    },
  })
);

type PropType = WithSnackbarProps;

function getShortenedMatrNo(
  student: StudentWithFetchedTeam,
  students: StudentWithFetchedTeam[]
): string {
  const otherStudents = students.filter(s => s.id !== student.id);
  const lengthOfNo = student.matriculationNo.length;

  for (let iteration = 1; iteration < lengthOfNo; iteration++) {
    const shortStudent = student.matriculationNo.substr(lengthOfNo - iteration, iteration);
    let isOkay = true;

    for (const otherStudent of otherStudents) {
      const shortOtherStudent = otherStudent.matriculationNo.substr(
        lengthOfNo - iteration,
        iteration
      );

      if (shortStudent === shortOtherStudent) {
        isOkay = false;
        break;
      }
    }

    if (isOkay) {
      return shortStudent.padStart(7, '*');
    }
  }

  return student.matriculationNo;
}

function AllStudentsAdminView({ enqueueSnackbar }: PropType): JSX.Element {
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState<StudentWithFetchedTeam[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [summaries, setSummaries] = useState<{ [studentId: string]: ScheinCriteriaSummary }>({});
  const [isCreatingCSVFile, setCreatingCSVFile] = useState(false);
  const {
    fetchTeamsOfStudents,
    editStudentAndFetchTeam: editStudentRequest,
    deleteStudent: deleteStudentRequest,
    getAllStudentsAndFetchTeams,
    getAllScheinExams,
    getAllTutorials,
    getScheinCriteriaSummaryOfAllStudents,
  } = useAxios();
  const dialog = useDialog();

  useEffect(() => {
    setIsLoading(true);
    getAllStudentsAndFetchTeams().then(response => {
      setStudents(response);
      setIsLoading(false);
    });
    getScheinCriteriaSummaryOfAllStudents().then(response => setSummaries(response));
    getAllTutorials().then(response => setTutorials(response));
  }, [fetchTeamsOfStudents, getAllStudentsAndFetchTeams]);

  function printOverviewSheet() {
    const studentDataToPrint: { matriculationNo: string; schein: string }[] = [];

    for (const student of students) {
      studentDataToPrint.push({
        matriculationNo: getShortenedMatrNo(student, students),
        schein: summaries[student.id].passed ? 'Bestanden' : 'Nicht bestanden',
      });
    }

    studentDataToPrint.sort((a, b) => a.matriculationNo.localeCompare(b.matriculationNo));

    printJS({
      printable: studentDataToPrint,
      properties: [
        { field: 'matriculationNo', displayName: 'Matrikelnummer' },
        { field: 'schein', displayName: 'Schein' },
      ],
      type: 'json',
      header: '<h4 class="custom-h4">Scheinliste</h4>',
      style:
        "* { font-family: 'Arial' }  td { padding: 0.5em 1em; font-family: 'Courier' } h4 { text-align: center }",
    });
  }

  const editStudent: (student: StudentWithFetchedTeam) => StudentFormSubmitCallback = student => (
    { firstname, lastname, matriculationNo, email, courseOfStudies, team },
    { setSubmitting, setFieldError }
  ) => {
    const studentWithSameMatrNo: StudentWithFetchedTeam | undefined = students.find(
      s => s.id !== student.id && s.matriculationNo === matriculationNo.toString()
    );

    if (studentWithSameMatrNo) {
      setFieldError('matriculationNo', 'Matrikelnummer bereits verwendet.');
      return;
    }

    const studentDTO: StudentDTO = {
      lastname,
      firstname,
      matriculationNo: matriculationNo.toString(),
      email,
      courseOfStudies,
      tutorial: student.tutorial,
      team: !team ? undefined : team,
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
          teams={student.team ? [student.team] : []}
          onSubmit={editStudent(student)}
          onCancelClicked={() => dialog.hide()}
          disableTeamDropdown={true}
        />
      ),
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

      const data: RowMap = {
        lastname,
        firstname,
        matriculationNo,
        scheinPassed: criteriaResult.passed + '',
        presentations: Object.values(presentationPoints)
          .reduce((prev, current) => prev + current, 0)
          .toString(),
      };

      for (const sheet of sheets) {
        const maxPoints = getPointsOfEntityAsString(sheet);
        const sheetResult = getPointsOfStudentOfSheet(points, sheet);
        data[`sheet-${sheet.sheetNo}`] = `${sheetResult}/${maxPoints}`;
      }

      for (const date of Object.values(attendance).map(at => at.date)) {
        const attendanceOfDate: Attendance = attendance[parseDateToMapKey(new Date(date))];
        data[`date-${format(new Date(date), 'yyyy-MM-dd')}`] = attendanceOfDate.state || '';
      }

      for (const exam of exams) {
        const scheinExamResult = getSumOfPointsOfStudentInScheinExam(scheinExamResults, exam.id);
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
            <Button
              variant='contained'
              color='primary'
              className={classes.printButton}
              onClick={printOverviewSheet}
              disabled={students.length === 0}
            >
              Scheinliste ausdrucken
            </Button>

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
            items={students}
            createRowFromItem={student => (
              <ExtendableStudentRow
                student={student}
                showTutorialNo
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
