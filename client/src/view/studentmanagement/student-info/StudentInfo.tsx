import { Box, Paper, Tab, Tabs, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { AttendanceState, IAttendance, IAttendanceDTO } from 'shared/model/Attendance';
import { ScheinCriteriaSummary } from 'shared/model/ScheinCriteria';
import { getNameOfEntity } from 'shared/util/helpers';
import BackButton from '../../../components/BackButton';
import Placeholder from '../../../components/Placeholder';
import TabPanel from '../../../components/TabPanel';
import { getScheinCriteriaSummaryOfStudent } from '../../../hooks/fetching/Scheincriteria';
import { getAllScheinExams } from '../../../hooks/fetching/ScheinExam';
import { getAllSheets } from '../../../hooks/fetching/Sheet';
import { getStudent, setAttendanceOfStudent } from '../../../hooks/fetching/Student';
import { getTutorial } from '../../../hooks/fetching/Tutorial';
import { useErrorSnackbar } from '../../../hooks/snackbar/useErrorSnackbar';
import { Scheinexam } from '../../../model/Scheinexam';
import { Sheet } from '../../../model/Sheet';
import { Student } from '../../../model/Student';
import { Tutorial } from '../../../model/Tutorial';
import { getStudentOverviewPath } from '../../../routes/Routing.helpers';
import AttendanceInformation from './components/AttendanceInformation';
import CriteriaCharts from './components/CriteriaCharts';
import EvaluationInformation from './components/EvaluationInformation';
import ScheinExamInformation from './components/ScheinExamInformation';
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
    criteriaCharts: {
      marginBottom: theme.spacing(1),
    },
    evaluationInfo: {
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

  const { enqueueSnackbar } = useSnackbar();
  const { setError } = useErrorSnackbar();

  const [student, setStudent] = useState<Student>();
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [exams, setExams] = useState<Scheinexam[]>([]);
  const [tutorialOfStudent, setTutorialOfStudent] = useState<Tutorial>();
  const [scheinStatus, setScheinStatus] = useState<ScheinCriteriaSummary>();
  const [selectedTab, setSelectedTab] = useState(0);

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
        enqueueSnackbar('Scheinstatus konnte nicht abgerufen werden.', { variant: 'error' });
      });

    getTutorial(student.tutorial.id)
      .then((response) => {
        setTutorialOfStudent(response);
      })
      .catch(() => {
        enqueueSnackbar('Tutorial konnte nicht abgerufen werden.', { variant: 'error' });
      });
  }, [student, enqueueSnackbar]);

  useEffect(() => {
    getAllSheets()
      .then((response) => setSheets(response))
      .catch(() => {
        enqueueSnackbar('Übungsblätter konnten nicht abgerufen werden.', { variant: 'error' });
      });

    getAllScheinExams()
      .then((response) => setExams(response))
      .catch(() => {
        enqueueSnackbar('Scheinklausuren konnten nicht abgerufen werden.', { variant: 'error' });
      });
  }, [enqueueSnackbar]);

  const handleTabChange = (_: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
  };

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
      date: date.toISODate(),
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
      date: date.toISODate(),
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
        <BackButton to={getStudentOverviewPath(tutorialId)} className={classes.backButton} />

        <Typography variant='h4'>{student && getNameOfEntity(student)}</Typography>

        <ScheinStatusBox scheinStatus={scheinStatus} marginLeft='auto' />
      </Box>

      <Placeholder
        placeholderText='Kein Studierender verfügbar.'
        showPlaceholder={false}
        loading={!student}
      >
        <Box display='flex' flexDirection='column' marginBottom={1}>
          {scheinStatus && (
            <CriteriaCharts
              scheinStatus={scheinStatus}
              firstCard={
                student && <StudentDetails student={student} className={classes.studentDetails} />
              }
              className={classes.criteriaCharts}
            />
          )}

          {student && (
            <Paper variant='outlined'>
              <Tabs value={selectedTab} onChange={handleTabChange}>
                <Tab label='Übungsblätter' />
                <Tab label='Anwesenheiten' />
                <Tab label='Scheinklausuren' />
              </Tabs>

              <TabPanel value={selectedTab} index={0}>
                <EvaluationInformation
                  student={student}
                  sheets={sheets}
                  className={classes.evaluationInfo}
                />
              </TabPanel>

              <TabPanel value={selectedTab} index={1}>
                {tutorialOfStudent && (
                  <AttendanceInformation
                    student={student}
                    tutorialOfStudent={tutorialOfStudent}
                    onAttendanceChange={handleStudentAttendanceChange(student)}
                    onNoteChange={handleStudentNoteChange(student)}
                  />
                )}
              </TabPanel>

              <TabPanel value={selectedTab} index={2}>
                <ScheinExamInformation
                  student={student}
                  exams={exams}
                  className={classes.evaluationInfo}
                />
              </TabPanel>
            </Paper>
          )}
        </Box>
      </Placeholder>
    </Box>
  );
}

export default StudentInfo;
