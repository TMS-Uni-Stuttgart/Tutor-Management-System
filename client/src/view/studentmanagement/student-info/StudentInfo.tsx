import { Box, Typography, Paper, Tabs, Tab, BoxProps } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { ScheinCriteriaSummary } from 'shared/dist/model/ScheinCriteria';
import { Student } from 'shared/dist/model/Student';
import { getNameOfEntity } from 'shared/dist/util/helpers';
import BackButton from '../../../components/BackButton';
import Placeholder from '../../../components/Placeholder';
import { getScheinCriteriaSummaryOfStudent, getStudent } from '../../../hooks/fetching/Student';
import { useErrorSnackbar } from '../../../hooks/useErrorSnackbar';
import { getStudentOverviewPath } from '../../../routes/Routing.helpers';
import CriteriaCharts from './components/CriteriaCharts';
import EvaluationInformation from './components/EvaluationInformation';
import ScheinStatusBox from './components/ScheinStatusBox';
import TabPanel from '../../../components/TabPanel';
import { getAllSheets } from '../../../hooks/fetching/Sheet';
import { Sheet } from 'shared/dist/model/Sheet';

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
  const [scheinStatus, setScheinStatus] = useState<ScheinCriteriaSummary>();
  const [selectedTab, setSelectedTab] = React.useState(0);

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
  };

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
  }, [student, enqueueSnackbar]);

  useEffect(() => {
    getAllSheets()
      .then(response => setSheets(response))
      .catch(() => {
        enqueueSnackbar('Übungsblätter konnten nicht abgerufen werden.', { variant: 'error' });
      });
  }, [enqueueSnackbar]);

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
        <Box display='flex' flexDirection='column'>
          {scheinStatus && (
            <CriteriaCharts scheinStatus={scheinStatus} className={classes.criteriaCharts} />
          )}

          {student && (
            <Paper variant='outlined'>
              <Tabs value={selectedTab} onChange={handleTabChange}>
                <Tab label='Bewertungen' />
                <Tab label='Anwesenheiten' />
              </Tabs>

              <TabPanel value={selectedTab} index={0}>
                <EvaluationInformation
                  student={student}
                  sheets={sheets}
                  className={classes.evaluationInfo}
                />
              </TabPanel>

              <TabPanel value={selectedTab} index={1}>
                <pre>{JSON.stringify(student.attendance, null, 2)}</pre>
              </TabPanel>
            </Paper>
          )}
        </Box>
      </Placeholder>
    </Box>
  );
}

export default StudentInfo;
