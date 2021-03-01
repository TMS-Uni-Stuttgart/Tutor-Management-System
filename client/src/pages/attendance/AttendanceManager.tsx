import { Typography } from '@material-ui/core';
import GREEN from '@material-ui/core/colors/green';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { AttendanceState, IAttendance, IAttendanceDTO } from 'shared/model/Attendance';
import { StudentStatus } from 'shared/model/Student';
import { NoteFormCallback } from '../../components/attendance-controls/components/AttendanceNotePopper';
import CustomSelect from '../../components/CustomSelect';
import DateOfTutorialSelection from '../../components/DateOfTutorialSelection';
import LoadingSpinner from '../../components/loading/LoadingSpinner';
import SubmitButton from '../../components/loading/SubmitButton';
import TableWithPadding from '../../components/TableWithPadding';
import { getAttendancePDF } from '../../hooks/fetching/Files';
import {
  getAllStudents,
  setAttendanceOfStudent,
  setCakeCountForStudent,
} from '../../hooks/fetching/Student';
import { getAllTutorials, getStudentsOfTutorial, getTutorial } from '../../hooks/fetching/Tutorial';
import { useLogin } from '../../hooks/LoginService';
import { useSettings } from '../../hooks/useSettings';
import { LoggedInUser } from '../../model/LoggedInUser';
import { Student } from '../../model/Student';
import { Tutorial } from '../../model/Tutorial';
import { parseDateToMapKey, saveBlob } from '../../util/helperFunctions';
import { useLogger } from '../../util/Logger';
import StudentAttendanceRow from './components/StudentsAttendanceRow';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
    },
    topBar: {
      display: 'flex',
      marginBottom: theme.spacing(2),
    },
    barItem: {
      flex: 1,
      marginRight: theme.spacing(2),
    },
    missingDateText: {
      marginTop: theme.spacing(8),
      textAlign: 'center',
    },
    allPresentButton: {
      marginRight: theme.spacing(2),
      backgroundColor: GREEN[600],
      color: theme.palette.getContrastText(GREEN[600]),
      '&:hover': {
        backgroundColor: GREEN[800],
        color: theme.palette.getContrastText(GREEN[800]),
      },
    },
  })
);

interface Props {
  tutorial?: string;
}

enum FilterOption {
  ACTIVE_ONLY = 'Nur aktive Studierende',
  ACTIVE_AND_NO_SCHEIN_REQUIRED = 'Aktive & mit Schein',
  ALL = 'Alle (aktiv & inaktiv)',
}

interface FilterParams {
  allStudents: Student[];
  filterOption: FilterOption;
  tutorial: Tutorial;
}

function getAvailableDates(
  tutorial: Tutorial | undefined,
  user: LoggedInUser | undefined,
  isAdminPage: boolean
): DateTime[] {
  if (!tutorial) {
    return [];
  }

  if (user && !isAdminPage) {
    const substituteTutorial = user.substituteTutorials.find((sub) => sub.id === tutorial.id);

    if (substituteTutorial) {
      return tutorial.dates.filter(
        (date) => substituteTutorial.dates.findIndex((d) => date.hasSame(d, 'day')) !== -1
      );
    }
  }

  return [...tutorial.dates];
}

function getFilteredStudents({ allStudents, filterOption, tutorial }: FilterParams): Student[] {
  return allStudents
    .filter((stud) => stud.tutorial.id === tutorial.id)
    .filter((stud) => {
      switch (filterOption) {
        case FilterOption.ACTIVE_ONLY:
          return stud.status === StudentStatus.ACTIVE;

        case FilterOption.ACTIVE_AND_NO_SCHEIN_REQUIRED:
          return (
            stud.status === StudentStatus.ACTIVE || stud.status === StudentStatus.NO_SCHEIN_REQUIRED
          );

        case FilterOption.ALL:
          return true;

        default:
          return false;
      }
    });
}

function AttendanceManager({ tutorial: tutorialFromProps }: Props): JSX.Element {
  const classes = useStyles();
  const logger = useLogger('AttendanceManager');

  const { userData } = useLogin();
  const { canStudentBeExcused } = useSettings();
  const { enqueueSnackbar } = useSnackbar();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPDF, setLoadingPDF] = useState(false);
  const [isSettingPresent, setSettingsPresent] = useState(false);

  const [date, setDate] = useState<DateTime>();

  const [tutorial, setTutorial] = useState<Tutorial>();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);

  const [fetchedStudents, setFetchedStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  const [filterOption, setFilterOption] = useState<FilterOption>(FilterOption.ACTIVE_ONLY);

  const availableDates = useMemo(() => getAvailableDates(tutorial, userData, !tutorialFromProps), [
    tutorial,
    userData,
    tutorialFromProps,
  ]);

  useEffect(() => {
    if (!!tutorialFromProps) {
      if (tutorialFromProps !== tutorial?.id) {
        setIsLoading(true);
        Promise.all([
          getTutorial(tutorialFromProps),
          getStudentsOfTutorial(tutorialFromProps),
        ]).then(([tutorial, students]) => {
          setTutorial(tutorial);
          setFetchedStudents(students);
          setIsLoading(false);
        });
        setDate(undefined);
      }
    } else if (tutorials.length === 0) {
      Promise.all([getAllTutorials(), getAllStudents()]).then(([tutorials, students]) => {
        setTutorial(undefined);
        setTutorials(tutorials);
        setFetchedStudents(students);
        setIsLoading(false);
      });
    }
  }, [tutorialFromProps, tutorials, tutorial]);

  useEffect(() => {
    if (tutorial) {
      setFilteredStudents(
        getFilteredStudents({ allStudents: fetchedStudents, filterOption, tutorial })
      );
    }
  }, [fetchedStudents, filterOption, tutorial]);

  function handleTutoriumSelectionChanged(e: ChangeEvent<{ name?: string; value: unknown }>) {
    if (typeof e.target.value !== 'string') {
      return;
    }

    const tutorial: Tutorial | undefined = tutorials.find((t) => t.id === e.target.value);
    setTutorial(tutorial);
    setDate(undefined);
  }

  const handlePutAttendanceResponse = (student: Student, attendance: IAttendance) => {
    const date = DateTime.fromISO(attendance.date);
    const dateKey = parseDateToMapKey(date);

    setFetchedStudents((students) =>
      students.map((innerStudent) => {
        if (innerStudent.id === student.id) {
          innerStudent.attendances.set(dateKey, attendance);
        }

        return innerStudent;
      })
    );

    return attendance;
  };

  async function handleStudentAttendanceChange(
    student: Student,
    attendanceState?: AttendanceState
  ) {
    if (!date) {
      return;
    }

    const attendance: IAttendance | undefined = student.getAttendance(date);
    const attendanceDTO: IAttendanceDTO = {
      state: attendanceState,
      date: date.toISODate() ?? 'DATE_NOTE_PARSEABLE',
      note: attendance ? attendance.note : '',
    };

    try {
      const response = await setAttendanceOfStudent(student.id, attendanceDTO);
      handlePutAttendanceResponse(student, response);
    } catch (reason) {
      logger.error(reason);
    }
  }

  function handleStudentNoteChange(student: Student): NoteFormCallback {
    return async ({ note }) => {
      if (!date) {
        return;
      }

      const attendance: IAttendance | undefined = student.getAttendance(date);
      const attendanceDTO: IAttendanceDTO = {
        state: attendance ? attendance.state : undefined,
        date: date.toISODate() ?? 'DATE_NOTE_PARSEABLE',
        note,
      };

      try {
        const response = await setAttendanceOfStudent(student.id, attendanceDTO);
        handlePutAttendanceResponse(student, response);
      } catch (reason) {
        logger.error(reason);
      }
    };
  }

  function handleFilteroptionChange(e: ChangeEvent<{ name?: string; value: unknown }>) {
    if (typeof e.target.value !== 'string') {
      return;
    }

    if (e.target.value === filterOption) {
      return;
    }

    const selectedOption: FilterOption | undefined = Object.values(FilterOption).find(
      (op) => op === e.target.value
    );

    if (!selectedOption) {
      throw new Error('Selected filter option is not a valid one.');
    }

    setFilterOption(selectedOption);
  }

  async function handleAllStudentPresent() {
    if (!date) {
      return;
    }

    setSettingsPresent(true);

    const promises: Promise<void>[] = [];

    for (const student of filteredStudents) {
      const attendance: IAttendance | undefined = student.getAttendance(date);

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
    const dateString = date.toFormat('yyyy-MM-dd');

    try {
      const blob = await getAttendancePDF(tutorial.id, dateString);

      saveBlob(blob, `Anwesenheit_${tutorial.slot}_${dateString}.pdf`);
    } catch (err) {
      enqueueSnackbar('PDF konnte nicht erstellt werden.', { variant: 'error' });
    } finally {
      setLoadingPDF(false);
    }
  }

  function handleCakeCountChange(student: Student) {
    return async (cakeCount: number) => {
      try {
        await setCakeCountForStudent(student.id, { cakeCount });

        setFetchedStudents((students) =>
          students.map((s) => {
            if (s.id === student.id) {
              s.cakeCount = cakeCount;
            }

            return s;
          })
        );
        enqueueSnackbar('Anzahl Kuchen wurde aktualisiert.', { variant: 'success' });
      } catch {
        enqueueSnackbar('Anzahl Kuchen konnte nicht aktualisert werden.', {
          variant: 'error',
        });
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
                value={tutorial?.id ?? ''}
                items={tutorials}
                itemToString={(tutorial) => `Tutorium Slot #${tutorial.slot}`}
                itemToValue={(tutorial) => tutorial.id}
                onChange={handleTutoriumSelectionChanged}
              />
            )}

            <DateOfTutorialSelection
              className={classes.barItem}
              availableDates={availableDates}
              onDateSelected={(date) => setDate(date)}
              disabled={!tutorial}
              value={date?.toISODate() ?? ''}
            />

            <CustomSelect
              label='Filtern nach...'
              emptyPlaceholder='Keine Filteroption vorhanden.'
              className={classes.barItem}
              value={filterOption ?? ''}
              items={Object.values(FilterOption)}
              itemToString={(option) => option}
              itemToValue={(option) => option}
              onChange={handleFilteroptionChange}
              disabled={!tutorial || !date}
            />

            <SubmitButton
              variant='contained'
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
              disabled={!tutorial || !date}
              tooltipText='Erstellt eine Unterschriftenliste für den ausgewählten Tag.'
            >
              Unterschriftenliste erstellen
            </SubmitButton>
          </div>

          {date ? (
            <TableWithPadding
              items={filteredStudents}
              createRowFromItem={(student) => {
                const attendance: IAttendance | undefined = student.getAttendance(date);

                return (
                  <StudentAttendanceRow
                    key={student.id}
                    student={student}
                    attendance={attendance}
                    onAttendanceSelection={(state) => handleStudentAttendanceChange(student, state)}
                    onNoteSave={handleStudentNoteChange(student)}
                    onCakeCountChanged={handleCakeCountChange(student)}
                    canBeExcused={canStudentBeExcused()}
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
