import { Box, CircularProgress, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { IGradingDTO } from 'shared/model/Gradings';
import { getNameOfEntity } from 'shared/util/helpers';
import BackButton from '../../../components/back-button/BackButton';
import CustomSelect from '../../../components/CustomSelect';
import Placeholder from '../../../components/Placeholder';
import { getScheinexam } from '../../../hooks/fetching/ScheinExam';
import { getStudent, setExamPointsOfStudent } from '../../../hooks/fetching/Student';
import { getStudentsOfTutorial } from '../../../hooks/fetching/Tutorial';
import { useCustomSnackbar } from '../../../hooks/snackbar/useCustomSnackbar';
import { Scheinexam } from '../../../model/Scheinexam';
import { Student } from '../../../model/Student';
import { ROUTES } from '../../../routes/Routing.routes';
import { convertFormStateToGradingDTO } from '../../points-sheet/enter-form/EnterPoints.helpers';
import ScheinexamPointsForm, {
  ScheinexamPointsFormSubmitCallback,
} from './components/ScheinexamPointsForm';

const useStyles = makeStyles((theme) =>
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

  const { enqueueSnackbar, setError, isError } = useCustomSnackbar();

  const [exam, setExam] = useState<Scheinexam>();
  const [student, setStudent] = useState<Student>();
  const [allStudents, setAllStudents] = useState<Student[]>([]);

  useEffect(() => {
    getScheinexam(examId)
      .then((response) => {
        setExam(response);
      })
      .catch(() => {
        setError('Scheinklausur konnte nicht abgerufen werden.');
      });
  }, [examId, setError]);

  useEffect(() => {
    getStudent(studentId)
      .then((response) => {
        setStudent(response);
      })
      .catch(() => {
        setError('Studierende/r konnte nicht abgerufen werden.');
      });
  }, [studentId, setError]);

  useEffect(() => {
    getStudentsOfTutorial(tutorialId)
      .then((response) => {
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

    history.push(ROUTES.SCHEIN_EXAMS_STUDENT.create({ tutorialId, examId, studentId }));
  };

  const handleSubmit: ScheinexamPointsFormSubmitCallback = async (values, { resetForm }) => {
    if (!student) {
      return;
    }

    const prevGrading = student.getGrading(examId);
    const updateDTO: IGradingDTO = convertFormStateToGradingDTO({
      values,
      examId,
      prevGrading,
    });

    try {
      await setExamPointsOfStudent(studentId, updateDTO);
      const updatedStudent = await getStudent(studentId);

      setStudent(updatedStudent);

      resetForm({ values: { ...values } });
      enqueueSnackbar(
        `Punkte für ${getNameOfEntity(student, {
          firstNameFirst: true,
        })} erfolgreich eingetragen.`,
        {
          variant: 'success',
        }
      );
    } catch {
      enqueueSnackbar(
        `Punkte für ${getNameOfEntity(student, {
          firstNameFirst: true,
        })} konnten nicht eingetragen werden.`,
        {
          variant: 'error',
        }
      );
    }
  };

  return (
    <Box display='flex' flexDirection='column' flex={1}>
      <Box display='flex' marginBottom={3}>
        <BackButton
          to={ROUTES.SCHEIN_EXAMS_OVERVIEW.create({ tutorialId, examId })}
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
          itemToValue={(s) => s.id}
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
