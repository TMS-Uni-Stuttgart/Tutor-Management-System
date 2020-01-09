import { Box, CircularProgress, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router';
import { ScheinExam } from 'shared/dist/model/Scheinexam';
import BackButton from '../../../components/BackButton';
import { getScheinexam } from '../../../hooks/fetching/ScheinExam';
import { useErrorSnackbar } from '../../../hooks/useErrorSnackbar';
import {
  getScheinexamPointsOverviewPath,
  getEnterPointsForScheinexamPath,
} from '../../../routes/Routing.helpers';
import Placeholder from '../../../components/Placeholder';
import CustomSelect from '../../../components/CustomSelect';
import { Student } from 'shared/dist/model/Student';
import { getStudent, setExamPointsOfStudent } from '../../../hooks/fetching/Student';
import { getStudentsOfTutorial } from '../../../hooks/fetching/Tutorial';
import { getNameOfEntity } from 'shared/dist/util/helpers';
import ScheinexamPointsForm from './components/ScheinexamPointsForm';
import {
  ScheinexamPointsFormSubmitCallback,
  convertFormStateToPointMap,
} from './components/ScheinexamPointsForm.helpers';
import { PointMap, UpdatePointsDTO } from 'shared/dist/model/Points';
import { useSnackbar } from 'notistack';

const useStyles = makeStyles(theme =>
  createStyles({
    backButton: {
      marginRight: theme.spacing(2),
      alignSelf: 'center',
    },
    titleSpinner: {
      margin: theme.spacing(0, 1),
    },
    studentSelect: {
      flex: 1,
    },
    form: {
      flex: 1,
    },
  })
);

interface RouteParams {
  tutorialId: string;
  examId: string;
  studentId: string;
}

function EnterScheinexamPoints(): JSX.Element {
  const classes = useStyles();

  const history = useHistory();
  const { tutorialId, examId, studentId } = useParams<RouteParams>();

  const { enqueueSnackbar } = useSnackbar();
  const { setError, isError } = useErrorSnackbar();

  const [exam, setExam] = useState<ScheinExam>();
  const [student, setStudent] = useState<Student>();
  const [allStudents, setAllStudents] = useState<Student[]>([]);

  useEffect(() => {
    getScheinexam(examId)
      .then(response => {
        setExam(response);
      })
      .catch(() => {
        setError('Scheinklausur konnte nicht abgerufen werden.');
      });
  }, [examId, setError]);

  useEffect(() => {
    getStudent(studentId)
      .then(response => {
        setStudent(response);
      })
      .catch(() => {
        setError('Studierende/r konnte nicht abgerufen werden.');
      });
  }, [studentId, setError]);

  useEffect(() => {
    getStudentsOfTutorial(tutorialId)
      .then(response => {
        setAllStudents(response);
      })
      .catch(() => {
        setAllStudents([]);
      });
  }, [tutorialId]);

  const handleStudentChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    if (!(typeof event.target.value === 'string')) {
      return;
    }

    const studentId = event.target.value as string;

    history.push(getEnterPointsForScheinexamPath({ tutorialId, examId, studentId }));
  };

  const handleSubmit: ScheinexamPointsFormSubmitCallback = async (values, { resetForm }) => {
    if (!student) {
      return;
    }

    const points: PointMap = convertFormStateToPointMap({ values, examId });
    const updateDTO: UpdatePointsDTO = { points: points.toDTO() };

    try {
      await setExamPointsOfStudent(studentId, updateDTO);
      const updatedStudent = await getStudent(studentId);

      setStudent(updatedStudent);

      resetForm({ values: { ...values } });
      enqueueSnackbar(`Punkte für ${getNameOfEntity(student)} erfolgreich eingetragen.`, {
        variant: 'success',
      });
    } catch {
      enqueueSnackbar(`Punkte für ${getNameOfEntity(student)} konnten nicht eingetragen werden.`, {
        variant: 'error',
      });
    }
  };

  return (
    <Box display='flex' flexDirection='column'>
      <Box display='flex' marginBottom={3}>
        <BackButton
          to={getScheinexamPointsOverviewPath({ tutorialId, examId })}
          className={classes.backButton}
        />

        <Typography variant='h4'>
          Punkte für Scheinklausur{' '}
          {exam ? (
            `#${exam.scheinExamNo}`
          ) : (
            <CircularProgress size={34} className={classes.titleSpinner} color='inherit' />
          )}{' '}
          eintragen
        </Typography>
      </Box>

      <Box display='flex' marginBottom={3}>
        <CustomSelect
          label='Studierende/r'
          emptyPlaceholder='Keine Studierenden verfügbar.'
          className={classes.studentSelect}
          items={allStudents.length > 0 ? allStudents : student ? [student] : []}
          itemToString={getNameOfEntity}
          itemToValue={s => s.id}
          value={student?.id ?? ''}
          onChange={handleStudentChange}
        />
      </Box>

      <Placeholder
        placeholderText='Kein/e Studierende/r ausgewählt.'
        showPlaceholder={!student}
        loading={!exam && !isError}
      >
        {exam && student && (
          <ScheinexamPointsForm
            key={exam.id}
            className={classes.form}
            exam={exam}
            student={student}
            onSubmit={handleSubmit}
          />
        )}
      </Placeholder>
    </Box>
  );
}

export default EnterScheinexamPoints;
