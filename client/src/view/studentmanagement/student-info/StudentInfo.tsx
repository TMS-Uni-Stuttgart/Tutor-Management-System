import { Box, CircularProgress, Typography } from '@material-ui/core';
import { createStyles, makeStyles, useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';
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

const useStyles = makeStyles(theme =>
  createStyles({
    backButton: {
      marginRight: theme.spacing(2),
      alignSelf: 'center',
    },
    statusLoadingSpinner: {
      marginRight: theme.spacing(1),
    },
    greenFont: {
      color: theme.palette.green.main,
    },
    redFont: {
      color: theme.palette.red.main,
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
  const theme = useTheme();

  const { studentId, tutorialId } = useParams<RouteParams>();

  const { enqueueSnackbar } = useSnackbar();
  const { setError } = useErrorSnackbar();

  const [student, setStudent] = useState<Student>();
  const [scheinStatus, setScheinStatus] = useState<ScheinCriteriaSummary>();

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

  return (
    <Box display='flex' flexDirection='column'>
      <Box display='flex' marginBottom={3}>
        <BackButton to={getStudentOverviewPath(tutorialId)} className={classes.backButton} />

        <Typography variant='h4'>{student && getNameOfEntity(student)}</Typography>

        <Box
          display='flex'
          alignItems='center'
          textAlign='center'
          border={1}
          marginLeft='auto'
          borderRadius={4}
          borderColor={
            scheinStatus
              ? scheinStatus.passed
                ? theme.palette.green.main
                : theme.palette.red.main
              : 'divider'
          }
          padding='5px 15px'
        >
          {scheinStatus ? (
            <Typography
              variant='button'
              className={clsx({
                [classes.greenFont]: scheinStatus.passed,
                [classes.redFont]: !scheinStatus.passed,
              })}
            >
              Schein {scheinStatus.passed ? 'bestanden' : 'nicht bestanden'}
            </Typography>
          ) : (
            <>
              <CircularProgress size='1rem' className={classes.statusLoadingSpinner} />
              <Typography variant='button'>Lade Status...</Typography>
            </>
          )}
        </Box>
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
            <EvaluationInformation student={student} className={classes.evaluationInfo} />
          )}
        </Box>
      </Placeholder>
    </Box>
  );
}

export default StudentInfo;
