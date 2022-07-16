import { Box, Grid, Paper, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { AttendanceState, IAttendance, IAttendanceDTO } from 'shared/model/Attendance';
import { ScheinCriteriaSummary } from 'shared/model/ScheinCriteria';
import BackButton from '../../components/back-button/BackButton';
import Placeholder from '../../components/Placeholder';
import { getScheinCriteriaSummaryOfStudent } from '../../hooks/fetching/Scheincriteria';
import { getAllScheinExams } from '../../hooks/fetching/ScheinExam';
import { getAllSheets } from '../../hooks/fetching/Sheet';
import { getAllShortTests } from '../../hooks/fetching/ShortTests';
import { getStudent, setAttendanceOfStudent } from '../../hooks/fetching/Student';
import { getTutorial } from '../../hooks/fetching/Tutorial';
import { useCustomSnackbar } from '../../hooks/snackbar/useCustomSnackbar';
import { useFetchState } from '../../hooks/useFetchState';
import { Student } from '../../model/Student';
import { Tutorial } from '../../model/Tutorial';
import { ROUTES } from '../../routes/Routing.routes';
import CriteriaCharts from './components/CriteriaCharts';
import GradingTabs from './components/GradingTabs';
import ScheinStatusBox from './components/ScheinStatusBox';
import StudentDetails from './components/StudentDetails';

const useStyles = makeStyles((theme) =>
  createStyles({
    backButton: {
      marginRight: theme.spacing(2),
      alignSelf: 'center',
    },
    studentDetails: {
      height: '100%',
    },
    cardGrid: {
      marginBottom: theme.spacing(1),
    },
  })
);

interface RouteParams {
  studentId: string;
  tutorialId?: string;
}

function StudentInfo(): JSX.Element {
  const classes = useStyles();

  const { studentId, tutorialId } = useParams<RouteParams>();
  const { enqueueSnackbar, setError } = useCustomSnackbar();

  const [student, setStudent] = useState<Student>();
  const [tutorialOfStudent, setTutorialOfStudent] = useState<Tutorial>();
  const [scheinStatus, setScheinStatus] = useState<ScheinCriteriaSummary>();

  const [sheets = []] = useFetchState({
    fetchFunction: getAllSheets,
    immediate: true,
    params: [],
  });
  const [exams = []] = useFetchState({
    fetchFunction: getAllScheinExams,
    immediate: true,
    params: [],
  });
  const [shortTests = []] = useFetchState({
    fetchFunction: getAllShortTests,
    immediate: true,
    params: [],
  });

  useEffect(() => {
    getStudent(studentId)
      .then((response) => setStudent(response))
      .catch(() => setError('Studierende/r konnte nicht abgerufen werden.'));
  }, [studentId, setError]);

  useEffect(() => {
    if (!student) {
      setScheinStatus(undefined);
      return;
    }

    getScheinCriteriaSummaryOfStudent(student.id)
      .then((response) => {
        setScheinStatus(response);
      })
      .catch(() => {
        enqueueSnackbar('Scheinstatus konnte nicht abgerufen werden.', {
          variant: 'error',
        });
      });

    getTutorial(student.tutorial.id)
      .then((response) => {
        setTutorialOfStudent(response);
      })
      .catch(() => {
        enqueueSnackbar('Tutorium konnte nicht abgerufen werden.', { variant: 'error' });
      });
  }, [student, enqueueSnackbar]);

  const handleStudentAttendanceChange = (student?: Student) => async (
    date: DateTime,
    attendanceState?: AttendanceState
  ) => {
    if (!student) {
      return;
    }

    const attendance: IAttendance | undefined = student.getAttendance(date);
    const attendanceDTO: IAttendanceDTO = {
      state: attendanceState,
      date: date.toISODate() ?? 'DATE_NOTE_PARSEABLE',
      note: attendance?.note ?? '',
    };

    try {
      await setAttendanceOfStudent(student.id, attendanceDTO);
      const updatedStudent = await getStudent(student.id);

      setStudent(updatedStudent);
    } catch {
      enqueueSnackbar('Anwesenheit konnte nicht gespeichert werden.', { variant: 'error' });
    }
  };

  const handleStudentNoteChange = (student: Student) => async (date: DateTime, note: string) => {
    if (!student) {
      return;
    }

    const attendance: IAttendance | undefined = student.getAttendance(date);
    const attendanceDTO: IAttendanceDTO = {
      state: attendance?.state,
      date: date.toISODate() ?? 'DATE_NOTE_PARSEABLE',
      note,
    };

    try {
      await setAttendanceOfStudent(student.id, attendanceDTO);
      const updatedStudent = await getStudent(student.id);

      setStudent(updatedStudent);
    } catch {
      enqueueSnackbar('Notiz konnte nicht gespeichert werden.', { variant: 'error' });
    }
  };

  return (
    <Box display='flex' flexDirection='column'>
      <Box display='flex' marginBottom={3}>
        <BackButton
          to={
            !!tutorialId
              ? ROUTES.STUDENTOVERVIEW.create({ tutorialId })
              : ROUTES.MANAGE_ALL_STUDENTS.create({})
          }
          className={classes.backButton}
        />

        <Typography variant='h4'>{student?.name}</Typography>

        <ScheinStatusBox scheinStatus={scheinStatus} marginLeft='auto' />
      </Box>

      <Placeholder
        placeholderText='Kein Studierender verfügbar.'
        showPlaceholder={false}
        loading={!student || !tutorialOfStudent}
      >
        <Box display='flex' flexDirection='column' marginBottom={1}>
          <Grid container spacing={2} className={classes.cardGrid}>
            <Grid item sm={12} md={6} lg={4}>
              {student && <StudentDetails student={student} className={classes.studentDetails} />}
            </Grid>

            {scheinStatus && <CriteriaCharts scheinStatus={scheinStatus} sm={12} md={6} lg={4} />}
          </Grid>

          {student && tutorialOfStudent && (
            <Paper variant='outlined'>
              <GradingTabs
                student={student}
                tutorialOfStudent={tutorialOfStudent}
                sheets={sheets}
                shortTests={shortTests}
                exams={exams}
                onAttendanceChange={handleStudentAttendanceChange(student)}
                onNoteChange={handleStudentNoteChange(student)}
              />
            </Paper>
          )}
        </Box>
      </Placeholder>
    </Box>
  );
}

export default StudentInfo;
