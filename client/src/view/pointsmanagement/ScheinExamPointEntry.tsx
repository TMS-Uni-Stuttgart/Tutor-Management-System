import React, { useState, useEffect, ChangeEvent } from 'react';
import { WithSnackbarProps, withSnackbar } from 'notistack';
import { RouteComponentProps, withRouter } from 'react-router';
import { useAxios } from '../../hooks/FetchingService';
import { Student } from '../../typings/ServerResponses';
import TableWithPadding from '../../components/TableWithPadding';
import PointsRow, { PointsSaveCallback } from './components/PointsRow';
import { getNameOfEntity, getDisplayStringOfScheinExam } from '../../util/helperFunctions';
import { Person as PersonIcon } from '@material-ui/icons';
import { ScheinExam } from '../../typings/RatingModel';
import { Typography } from '@material-ui/core';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import CustomSelect from '../../components/CustomSelect';
import { UpdatePointsDTO } from '../../typings/RequestDTOs';

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

    const points: UpdatePointsDTO = {
      id: currentExam.id,
      exercises: values,
    };

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
        <TableWithPadding
          items={students}
          createRowFromItem={student => (
            <PointsRow
              label={getNameOfEntity(student)}
              icon={PersonIcon}
              entity={student}
              pointsMap={student.scheinExamResults}
              entityWithExercises={currentExam}
              tabIndexForRow={students.indexOf(student) + 1}
              onPointsSave={handleSavePoints(student)}
            />
          )}
          placeholder='Keine Studierenden verfügbar.'
        />
      ) : (
        <Typography className={classes.placeholder} variant='h6'>
          Keine Scheinklausur ausgewählt.
        </Typography>
      )}
    </div>
  );
}

export default withRouter(withSnackbar(ScheinExamPointEntry));
