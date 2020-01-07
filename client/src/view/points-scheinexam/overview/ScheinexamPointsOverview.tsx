import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React, { useEffect, useState, ChangeEvent } from 'react';
import { useHistory, useParams } from 'react-router';
import { ScheinExam } from 'shared/dist/model/Scheinexam';
import Placeholder from '../../../components/Placeholder';
import { getAllScheinExams } from '../../../hooks/fetching/ScheinExam';
import { useErrorSnackbar } from '../../../hooks/useErrorSnackbar';
import CustomSelect from '../../../components/CustomSelect';
import { getScheinexamPointsOverviewPath } from '../../../routes/Routing.helpers';
import { Student } from 'shared/dist/model/Student';
import { getStudentsOfTutorial } from '../../../hooks/fetching/Tutorial';
import StudentCardList from './components/StudentCardList';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
    },
    topBar: {
      display: 'flex',
      marginBottom: theme.spacing(2),
      alignItems: 'center',
    },
    examSelect: {
      flex: 1,
    },
  })
);

interface RouteParams {
  tutorialId: string;
  examId?: string;
}

function ScheinexamPointsOverview(): JSX.Element {
  const classes = useStyles();

  const history = useHistory();
  const { tutorialId, examId } = useParams<RouteParams>();

  const { setError } = useErrorSnackbar();

  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<ScheinExam[]>([]);
  const [selectedExam, setSelectedExam] = useState<ScheinExam>();

  useEffect(() => {
    console.log('FETCHING EXAMS'); // FIXME: REMOVE ME.

    getAllScheinExams()
      .then(response => {
        setExams(response);
      })
      .catch(() => setError('Scheinklausuren konnten nicht abgerufen werden.'));
  }, [setError]);

  useEffect(() => {
    if (!examId) {
      setSelectedExam(undefined);
      return;
    }

    const newSelected = exams.find(e => e.id === examId);
    setSelectedExam(newSelected);
  }, [examId, exams]);

  useEffect(() => {
    getStudentsOfTutorial(tutorialId)
      .then(response => {
        setStudents(response);
      })
      .catch(() => setError('Scheinklausuren konnten nicht abgerufen werden.'));
  }, [tutorialId, setError]);

  const handleScheinexamSelection = (e: ChangeEvent<{ name?: string; value: unknown }>) => {
    if (typeof e.target.value !== 'string') {
      return;
    }

    const examId: string = e.target.value;
    history.push(getScheinexamPointsOverviewPath({ tutorialId, examId }));
  };

  return (
    <div className={classes.root}>
      <div className={classes.topBar}>
        <CustomSelect
          label='Scheinklausur wählen'
          emptyPlaceholder='Keine Scheinklausuren vorhanden.'
          className={classes.examSelect}
          items={exams}
          itemToString={exam => `Scheinklausur #${exam.scheinExamNo.toString().padStart(2, '0')}`}
          itemToValue={exam => exam.id}
          value={selectedExam?.id ?? ''}
          onChange={handleScheinexamSelection}
        />
      </div>

      <Placeholder
        placeholderText='Keine Scheinklausur ausgewählt.'
        showPlaceholder={!selectedExam}
        loading={(!!examId && !selectedExam) || (!!selectedExam && students.length === 0)}
      >
        {selectedExam && <StudentCardList students={students} />}
      </Placeholder>
    </div>
  );
}

export default ScheinexamPointsOverview;
