import { Typography } from '@material-ui/core';
import GREEN from '@material-ui/core/colors/green';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { format, isSameDay } from 'date-fns';
import { useSnackbar } from 'notistack';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { Attendance, AttendanceDTO, AttendanceState } from 'shared/dist/model/Attendance';
import { LoggedInUser, TutorInfo } from 'shared/dist/model/User';
import CustomSelect from '../../components/CustomSelect';
import DateOfTutorialSelection from '../../components/DateOfTutorialSelection';
import SubmitButton from '../../components/forms/components/SubmitButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import TableWithPadding from '../../components/TableWithPadding';
import { useAxios } from '../../hooks/FetchingService';
import { useLogin } from '../../hooks/LoginService';
import {
  StudentWithFetchedTeam,
  TutorialWithFetchedStudents as Tutorial,
} from '../../typings/types';
import { parseDateToMapKey, saveBlob } from '../../util/helperFunctions';
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
    allPresentButton: {
      marginRight: theme.spacing(2),
      backgroundColor: GREEN[600],
      color: theme.palette.getContrastText(GREEN[600]),
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
      return tutorial.dates
        .filter(
          date =>
            substituteTutorial.dates.findIndex(d => isSameDay(new Date(date), new Date(d))) !== -1
        )
        .map(d => new Date(d));
    }
  }

  return tutorial.dates.map(d => new Date(d));
}

function AttendanceManager({ tutorial: tutorialFromProps }: Props): JSX.Element {
  const classes = useStyles();
  const { userData } = useLogin();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPDF, setLoadingPDF] = useState(false);
  const [isSettingPresent, setSettingsPresent] = useState(false);

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [students, setStudents] = useState<StudentWithFetchedTeam[]>([]);

  const [tutorInfo, setTutorInfo] = useState<TutorInfo | undefined>();
  const [tutorial, setTutorial] = useState<Tutorial | undefined>();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);

  const availableDates = getAvailableDates(tutorial, userData, !tutorialFromProps);

  const { enqueueSnackbar } = useSnackbar();
  const {
    setAttendanceOfStudent,
    setCakeCountForStudent,
    getAllTutorialsAndFetchStudents,
    getTutorInfoOfTutorial,
    getAttendancePDF,
  } = useAxios();

  useEffect(() => {
    setTutorial(tutorialFromProps);
  }, [tutorialFromProps]);

  useEffect(() => {
    if (tutorial) {
      setStudents(tutorial.students);
      getTutorInfoOfTutorial(tutorial.id).then(info => setTutorInfo(info));
    } else {
      setStudents([]);
    }

    setDate(undefined);
  }, [tutorial, getTutorInfoOfTutorial]);

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
        state: attendance ? attendance.state : undefined,
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

  async function handleAllStudentPresent() {
    if (!date) {
      return;
    }

    setSettingsPresent(true);

    const dateKey = parseDateToMapKey(date);
    const promises: Promise<void>[] = [];

    for (const student of students) {
      const attendance: Attendance | undefined = student.attendance[dateKey];

      if (!attendance || !attendance.state) {
        promises.push(handleStudentAttendanceChange(student, AttendanceState.PRESENT));
      }
    }

    await Promise.all(promises);

    setSettingsPresent(false);
  }

  async function printAttendanceSheet() {
    if (!tutorial || !date || !userData) {
      return;
    }

    setLoadingPDF(true);
    const dateString = format(date, 'yyyy-MM-dd');

    try {
      const blob = await getAttendancePDF(tutorial.id, dateString);

      saveBlob(blob, `Anwesenheit_${tutorial.slot}_${dateString}.pdf`);
    } catch (err) {
      enqueueSnackbar('PDF konnte nicht erstellt werden.', { variant: 'error' });
    } finally {
      setLoadingPDF(false);
    }
  }

  function handleCakeCountChange(student: StudentWithFetchedTeam) {
    return async (cakeCount: number) => {
      try {
        await setCakeCountForStudent(student.id, { cakeCount });

        setStudents(students =>
          students.map(s => {
            if (s.id === student.id) {
              s.cakeCount = cakeCount;
            }

            return s;
          })
        );
        enqueueSnackbar('Anzahll Kuchen wurde aktualisiert.', { variant: 'success' });
      } catch {
        enqueueSnackbar('Anzahl Kuchen konnte nicht aktualisert werden.', { variant: 'error' });
      }
    };
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

            <SubmitButton
              variant='contained'
              color='primary'
              isSubmitting={isSettingPresent}
              className={classes.allPresentButton}
              onClick={handleAllStudentPresent}
              disabled={!tutorial || !date}
              modalText='Ändere Anwesenheitsstatus...'
              tooltipText='Setzt alle Studierenden, die noch keinen Status haben, auf anwesend.'
            >
              Alle anwesend
            </SubmitButton>

            <SubmitButton
              variant='contained'
              color='primary'
              isSubmitting={isLoadingPDF}
              onClick={printAttendanceSheet}
              disabled={!tutorial || !date || !tutorInfo}
              tooltipText='Erstellt eine Unterschriftenliste für den ausgewählten Tag.'
            >
              Unterschriftenliste erstellen
            </SubmitButton>
          </div>

          {date ? (
            <TableWithPadding
              items={students}
              createRowFromItem={student => {
                const dateKey: string = parseDateToMapKey(date);
                const attendance: Attendance | undefined = student.attendance[dateKey];

                return (
                  <StudentAttendanceRow
                    key={student.id}
                    student={student}
                    attendance={attendance}
                    onAttendanceSelection={state => handleStudentAttendanceChange(student, state)}
                    onNoteSave={handleStudentNoteChange(student)}
                    onCakeCountChanged={handleCakeCountChange(student)}
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
