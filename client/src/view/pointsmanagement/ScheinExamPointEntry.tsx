import { Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Account as PersonIcon } from 'mdi-material-ui';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { PointMap, UpdatePointsDTO } from 'shared/dist/model/Points';
import { ScheinExam } from 'shared/dist/model/Scheinexam';
import { Student } from 'shared/dist/model/Student';
import { getNameOfEntity } from 'shared/dist/util/helpers';
import CustomSelect from '../../components/CustomSelect';
import { useAxios } from '../../hooks/FetchingService';
import { getDisplayStringOfScheinExam } from '../../util/helperFunctions';
import PointsCard, {
  convertPointsCardFormStateToDTO,
  PointsSaveCallback,
} from './components/points-card/PointsCard';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
    },
    sheetSelect: {
      marginBottom: theme.spacing(2),
    },
    placeholder: {
      marginTop: theme.spacing(8),
      textAlign: 'center',
    },
    pointCard: {
      marginTop: theme.spacing(2),
    },
  })
);

interface Params {
  tutorialId: string;
}

type Props = WithSnackbarProps & RouteComponentProps<Params>;

function ScheinExamPointEntry({ match, enqueueSnackbar }: Props): JSX.Element {
  const classes = useStyles();
  const {
    getStudentsOfTutorial,
    getAllScheinExams,
    setExamPointsOfStudent,
    getStudent,
  } = useAxios();

  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<ScheinExam[]>([]);
  const [currentExam, setCurrentExam] = useState<ScheinExam | undefined>(undefined);

  useEffect(() => {
    getStudentsOfTutorial(match.params.tutorialId).then(students => setStudents(students));

    getAllScheinExams().then(exams => setExams(exams));
  }, [getStudentsOfTutorial, getAllScheinExams, match.params.tutorialId]);

  function onExamSelection(e: ChangeEvent<{ name?: string; value: unknown }>) {
    if (typeof e.target.value !== 'string') {
      return;
    }

    const exam: ScheinExam | undefined = exams.find(exam => exam.id === e.target.value);
    setCurrentExam(exam);
  }

  const handleSavePoints: (student: Student) => PointsSaveCallback = student => async (
    values,
    { resetForm, setSubmitting }
  ) => {
    if (!currentExam) {
      return;
    }

    const points: UpdatePointsDTO = convertPointsCardFormStateToDTO(values, currentExam);

    try {
      await setExamPointsOfStudent(student.id, points);

      const updatedStudent = await getStudent(student.id);
      setStudents(students.map(s => (s.id === student.id ? updatedStudent : s)));

      resetForm({ values: { ...values } });
      enqueueSnackbar(`Punkte für ${getNameOfEntity(student)} erfolgreich eingetragen.`, {
        variant: 'success',
      });
    } catch (reason) {
      console.error(reason);
      enqueueSnackbar(`Punkte für ${getNameOfEntity(student)} eingetragen fehlgeschlagen.`, {
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={classes.root}>
      <CustomSelect
        label='Scheinklausur wählen'
        emptyPlaceholder='Keine Scheinklausuren vorhanden.'
        className={classes.sheetSelect}
        items={exams}
        itemToString={getDisplayStringOfScheinExam}
        itemToValue={exam => exam.id}
        value={currentExam ? currentExam.id : ''}
        onChange={onExamSelection}
      />

      {currentExam ? (
        students.length > 0 ? (
          students.map(student => (
            <PointsCard
              key={student.id}
              className={classes.pointCard}
              title={getNameOfEntity(student)}
              avatar={<PersonIcon />}
              entity={{ id: student.id, points: new PointMap(student.scheinExamResults) }}
              entityWithExercises={currentExam}
              onPointsSave={handleSavePoints(student)}
            />
          ))
        ) : (
          <Typography className={classes.placeholder} variant='h6'>
            Keine Studierenden verfügbar.
          </Typography>
        )
      ) : (
        <Typography className={classes.placeholder} variant='h6'>
          Keine Scheinklausur ausgewählt.
        </Typography>
      )}
    </div>
  );
}

export default withRouter(withSnackbar(ScheinExamPointEntry));
