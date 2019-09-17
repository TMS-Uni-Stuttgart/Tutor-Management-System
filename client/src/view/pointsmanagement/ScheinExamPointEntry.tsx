import { Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { UpdatePointsDTO } from 'shared/dist/model/Points';
import { ScheinExam } from 'shared/dist/model/Scheinexam';
import { Student } from 'shared/dist/model/Student';
import CustomSelect from '../../components/CustomSelect';
import TableWithPadding from '../../components/TableWithPadding';
import { useAxios } from '../../hooks/FetchingService';
import { getDisplayStringOfScheinExam, getNameOfEntity } from '../../util/helperFunctions';

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

  // TODO: Reimplement me!
  // const handleSavePoints: (student: Student) => PointsSaveCallback = student => async (
  //   values,
  //   { resetForm, setSubmitting }
  // ) => {
  //   if (!currentExam) {
  //     return;
  //   }

  //   const points: UpdatePointsDTO = {
  //     id: currentExam.id,
  //     exercises: values,
  //   };

  //   try {
  //     await setExamPointsOfStudent(student.id, points);

  //     const updatedStudent = await getStudent(student.id);
  //     setStudents(students.map(s => (s.id === student.id ? updatedStudent : s)));

  //     resetForm({ values: { ...values } });
  //     enqueueSnackbar(`Punkte für ${getNameOfEntity(student)} erfolgreich eingetragen.`, {
  //       variant: 'success',
  //     });
  //   } catch (reason) {
  //     console.error(reason);
  //     enqueueSnackbar(`Punkte für ${getNameOfEntity(student)} eingetragen fehlgeschlagen.`, {
  //       variant: 'error',
  //     });
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

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
            <div>NOT IMPLEMENTED</div>
            // <PointsRow
            //   label={getNameOfEntity(student)}
            //   icon={PersonIcon}
            //   entity={student}
            //   pointsMap={student.scheinExamResults}
            //   entityWithExercises={currentExam}
            //   tabIndexForRow={students.indexOf(student) + 1}
            //   onPointsSave={handleSavePoints(student)}
            // />
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
