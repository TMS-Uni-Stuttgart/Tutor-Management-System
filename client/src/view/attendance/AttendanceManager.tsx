import { Button, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { compareAsc, format } from 'date-fns';
import deLocale from 'date-fns/locale/de';
import printJS from 'print-js';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { Attendance, AttendanceDTO, AttendanceState } from 'shared/dist/model/Attendance';
import { LoggedInUser, TutorInfo } from 'shared/dist/model/User';
import CustomSelect from '../../components/CustomSelect';
import DateOfTutorialSelection from '../../components/DateOfTutorialSelection';
import LoadingSpinner from '../../components/LoadingSpinner';
import TableWithPadding from '../../components/TableWithPadding';
import { useAxios } from '../../hooks/FetchingService';
import { useLogin } from '../../hooks/LoginService';
import {
  StudentWithFetchedTeam,
  TutorialWithFetchedStudents as Tutorial,
} from '../../typings/types';
import {
  getDisplayStringForTutorial,
  getNameOfEntity,
  parseDateToMapKey,
} from '../../util/helperFunctions';
import StudentAttendanceRow, { NoteFormCallback } from './components/StudentsAttendanceRow';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
    },
    topBar: {
      display: 'flex',
    },
    barItem: {
      flex: 1,
      marginRight: theme.spacing(2),
    },
    missingDateText: {
      marginTop: 64,
      textAlign: 'center',
    },
    printButton: {
      marginRight: theme.spacing(1),
    },
  })
);

interface Props {
  tutorial?: Tutorial;
}

function getAvailableDates(
  tutorial: Tutorial | undefined,
  user: LoggedInUser | undefined,
  isAdminPage: boolean
): Date[] {
  if (!tutorial) {
    return [];
  }

  if (user && !isAdminPage) {
    const substituteTutorial = user.substituteTutorials.find(sub => sub.id === tutorial.id);

    if (substituteTutorial) {
      return tutorial.dates.filter(
        date => substituteTutorial.dates.findIndex(d => compareAsc(date, d) === 0) !== -1
      );
    }
  }

  return tutorial.dates;
}

function isSubstituteTutor(tutorial: Tutorial, user: LoggedInUser): boolean {
  return user.substituteTutorials.find(sub => sub.id === tutorial.id) !== undefined;
}

function AttendanceManager({ tutorial: tutorialFromProps }: Props): JSX.Element {
  const classes = useStyles();
  const { userData } = useLogin();

  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [students, setStudents] = useState<StudentWithFetchedTeam[]>([]);

  const [tutorInfo, setTutorInfo] = useState<TutorInfo | undefined>();
  const [tutorial, setTutorial] = useState<Tutorial | undefined>();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);

  const availableDates = getAvailableDates(tutorial, userData, !tutorialFromProps);

  const {
    setAttendanceOfStudent,
    getAllTutorialsAndFetchStudents,
    fetchTeamsOfStudents,
    getTutorInfoOfTutorial,
  } = useAxios();

  useEffect(() => {
    setTutorial(tutorialFromProps);
  }, [tutorialFromProps]);

  useEffect(() => {
    if (tutorial) {
      fetchTeamsOfStudents(tutorial.students).then(response => setStudents(response));
      getTutorInfoOfTutorial(tutorial.id).then(info => setTutorInfo(info));
    } else {
      setStudents([]);
    }

    setDate(undefined);
  }, [tutorial, fetchTeamsOfStudents, getTutorInfoOfTutorial]);

  useEffect(() => {
    if (!tutorialFromProps) {
      setIsLoading(true);
      getAllTutorialsAndFetchStudents().then(response => {
        setTutorials(response);
        setIsLoading(false);
      });
    }
  }, [getAllTutorialsAndFetchStudents, tutorialFromProps]);

  function handleTutoriumSelectionChanged(e: ChangeEvent<{ name?: string; value: unknown }>) {
    if (typeof e.target.value !== 'string') {
      return;
    }

    const tutorial: Tutorial | undefined = tutorials.find(t => t.id === e.target.value);
    setTutorial(tutorial);
    setDate(undefined);
  }

  const handlePutAttendanceResponse = (student: StudentWithFetchedTeam, attendance: Attendance) => {
    const date = new Date(attendance.date);
    const dateKey = parseDateToMapKey(date);

    setStudents(
      students.map(innerStudent => {
        if (innerStudent.id === student.id) {
          innerStudent.attendance = {
            ...innerStudent.attendance,
            [dateKey]: attendance,
          };
        }

        return innerStudent;
      })
    );

    return attendance;
  };

  async function handleStudentAttendanceChange(
    student: StudentWithFetchedTeam,
    attendanceState?: AttendanceState
  ) {
    if (!date) {
      return;
    }

    const attendance: Attendance | undefined = student.attendance[parseDateToMapKey(date)];
    const attendanceDTO: AttendanceDTO = {
      state: attendanceState,
      date: date.toDateString(),
      note: attendance ? attendance.note : '',
    };

    try {
      const response = await setAttendanceOfStudent(student.id, attendanceDTO);
      handlePutAttendanceResponse(student, response);
    } catch (reason) {
      console.log(reason);
    }
  }

  function handleStudentNoteChange(student: StudentWithFetchedTeam): NoteFormCallback {
    return async ({ note }, { setSubmitting }, closeDialog) => {
      if (!date) {
        return;
      }

      const attendance: Attendance | undefined = student.attendance[parseDateToMapKey(date)];
      const attendanceDTO: AttendanceDTO = {
        state: attendance.state,
        date: date.toDateString(),
        note,
      };

      try {
        const response = await setAttendanceOfStudent(student.id, attendanceDTO);
        handlePutAttendanceResponse(student, response);

        closeDialog();
      } catch (reason) {
        console.error(reason);
        setSubmitting(false);
      }
    };
  }

  function printAttendanceSheet() {
    if (!tutorial || !date || !userData) {
      return;
    }

    const tutorialDisplay = getDisplayStringForTutorial(tutorial);
    const tutorName = tutorInfo
      ? getNameOfEntity(tutorInfo, { lastNameFirst: true })
      : 'KEIN TUTOR';

    const substitutePart = isSubstituteTutor(tutorial, userData)
      ? `, Ersatztutor: ${getNameOfEntity(userData)}`
      : '';

    const dateString = format(date, 'dd.MM.yyyy', { locale: deLocale });

    const studentsPrintObjects = students
      .sort((a, b) => {
        const nameOfA = `${a.lastname}, ${a.firstname}`;
        const nameOfB = `${b.lastname}, ${b.firstname}`;

        return nameOfA.localeCompare(nameOfB);
      })
      .map(({ firstname, lastname }) => ({
        firstname,
        lastname,
        signing: '',
      }));

    printJS({
      printable: studentsPrintObjects,
      properties: [
        { field: 'lastname', displayName: 'Nachname' },
        { field: 'firstname', displayName: 'Vorname' },
        { field: 'signing', displayName: 'Unterschrift' },
      ],
      type: 'json',
      header: `<h4>Anwesenheitsliste</h4> <table style="width: 100%; margin-bottom: 1em" ><tbody><tr><td style="padding: 0; text-align: left">${tutorialDisplay}, Tutor: ${tutorName}${substitutePart}</td> <td style="padding: 0; text-align: right">Datum: ${dateString}</td></tr></tbody></table>`,
      style: "* { font-family: 'Arial' }  td { padding: 0.5em 1em } h4 { text-align: center }",
    });
  }

  return (
    <div className={classes.root}>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className={classes.topBar}>
            {!tutorialFromProps && (
              <CustomSelect
                label='Tutorium wählen'
                emptyPlaceholder='Keine Tutorien vorhanden.'
                className={classes.barItem}
                value={tutorial ? tutorial.id : ''}
                items={tutorials}
                itemToString={tutorial => `Tutorium Slot #${tutorial.slot}`}
                itemToValue={tutorial => tutorial.id}
                onChange={handleTutoriumSelectionChanged}
              />
            )}

            <DateOfTutorialSelection
              className={classes.barItem}
              // tutorial={tutorial}
              availableDates={availableDates}
              onDateSelected={date => setDate(date)}
              disabled={!tutorial}
              value={date ? date.toISOString() : ''}
            />

            <Button
              type='button'
              variant='contained'
              color='primary'
              className={classes.printButton}
              onClick={printAttendanceSheet}
              disabled={!tutorial || !date || !tutorInfo}
            >
              Unterschriftenliste ausdrucken
            </Button>
          </div>

          {date ? (
            <TableWithPadding
              items={students}
              createRowFromItem={student => {
                const dateKey: string = parseDateToMapKey(date);
                const attendance: Attendance | undefined = student.attendance[dateKey];

                console.log(student.attendance);
                console.log(dateKey);
                console.log(attendance);

                return (
                  <StudentAttendanceRow
                    key={student.id}
                    student={student}
                    attendance={attendance}
                    onAttendanceSelection={state => handleStudentAttendanceChange(student, state)}
                    onNoteSave={handleStudentNoteChange(student)}
                  />
                );
              }}
              placeholder={'Keine Studierenden gefunden.'}
            />
          ) : (
            <Typography variant='h6' className={classes.missingDateText}>
              {!tutorialFromProps && !tutorial
                ? 'Wähle zuerst ein Tutorial und einen Termin aus.'
                : 'Wähle zuerst einen Termin aus.'}
            </Typography>
          )}
        </>
      )}
    </div>
  );
}

export default AttendanceManager;
