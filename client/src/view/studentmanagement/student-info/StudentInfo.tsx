import { Box, Paper, Tab, Tabs, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Attendance, AttendanceDTO, AttendanceState } from 'shared/dist/model/Attendance';
import { ScheinCriteriaSummary } from 'shared/dist/model/ScheinCriteria';
import { Sheet } from 'shared/dist/model/Sheet';
import { Student } from 'shared/dist/model/Student';
import { Tutorial } from 'shared/dist/model/Tutorial';
import { getNameOfEntity } from 'shared/dist/util/helpers';
import BackButton from '../../../components/BackButton';
import Placeholder from '../../../components/Placeholder';
import TabPanel from '../../../components/TabPanel';
import { getAllSheets } from '../../../hooks/fetching/Sheet';
import {
  getScheinCriteriaSummaryOfStudent,
  getStudent,
  setAttendanceOfStudent,
} from '../../../hooks/fetching/Student';
import { getTutorial } from '../../../hooks/fetching/Tutorial';
import { useErrorSnackbar } from '../../../hooks/useErrorSnackbar';
import { getStudentOverviewPath } from '../../../routes/Routing.helpers';
import { parseDateToMapKey } from '../../../util/helperFunctions';
import AttendanceInformation from './components/AttendanceInformation';
import CriteriaCharts from './components/CriteriaCharts';
import EvaluationInformation from './components/EvaluationInformation';
import ScheinExamInformation from './components/ScheinExamInformation';
import ScheinStatusBox from './components/ScheinStatusBox';
import { getAllScheinExams } from '../../../hooks/fetching/ScheinExam';
import { ScheinExam } from 'shared/dist/model/Scheinexam';

const useStyles = makeStyles(theme =>
  createStyles({
    backButton: {
      marginRight: theme.spacing(2),
      alignSelf: 'center',
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
  const [exams, setExams] = useState<ScheinExam[]>([]);
  const [tutorialOfStudent, setTutorialOfStudent] = useState<Tutorial>();
  const [scheinStatus, setScheinStatus] = useState<ScheinCriteriaSummary>();
  const [selectedTab, setSelectedTab] = React.useState(0);

  useEffect(() => {
    getStudent(studentId)
      .then(response => setStudent(response))
      .catch(() => setError('Studierende/r konnte nicht abgerufen werden.'));
  }, [studentId, setError]);

  useEffect(() => {
    if (!student) {
      setScheinStatus(undefined);
      return;
    }

    getScheinCriteriaSummaryOfStudent(student.id)
      .then(response => {
        setScheinStatus(response);
      })
      .catch(() => {
        enqueueSnackbar('Scheinstatus konnte nicht abgerufen werden.', { variant: 'error' });
      });

    getTutorial(student.tutorial)
      .then(response => {
        setTutorialOfStudent(response);
      })
      .catch(() => {
        enqueueSnackbar('Tutorial konnte nicht abgerufen werden.', { variant: 'error' });
      });
  }, [student, enqueueSnackbar]);

  useEffect(() => {
    getAllSheets()
      .then(response => setSheets(response))
      .catch(() => {
        enqueueSnackbar('Übungsblätter konnten nicht abgerufen werden.', { variant: 'error' });
      });

    getAllScheinExams()
      .then(response => setExams(response))
      .catch(() => {
        enqueueSnackbar('Scheinklausuren konnten nicht abgerufen werden.', { variant: 'error' });
      });
  }, [enqueueSnackbar]);

  const handleTabChange = (_: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleStudentAttendanceChange = (student?: Student) => async (
    date: Date,
    attendanceState?: AttendanceState
  ) => {
    if (!student) {
      return;
    }

    const attendance: Attendance | undefined = student.attendance[parseDateToMapKey(date)];
    const attendanceDTO: AttendanceDTO = {
      state: attendanceState,
      date: date.toDateString(),
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

  const handleStudentNoteChange = (student: Student) => async (date: Date, note: string) => {
    if (!student) {
      return;
    }

    const attendance: Attendance | undefined = student.attendance[parseDateToMapKey(date)];
    const attendanceDTO: AttendanceDTO = {
      state: attendance?.state,
      date: date.toDateString(),
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
              firstCard={<div>IMPLEMENT ME</div>}
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
