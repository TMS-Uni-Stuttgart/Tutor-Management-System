import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import CustomSelect from '../../../components/CustomSelect';
import Placeholder from '../../../components/Placeholder';
import { getGradingsOfTutorial } from '../../../hooks/fetching/Grading';
import { getAllScheinExams } from '../../../hooks/fetching/ScheinExam';
import { getStudentsOfTutorial } from '../../../hooks/fetching/Tutorial';
import { useErrorSnackbar } from '../../../hooks/snackbar/useErrorSnackbar';
import { GradingList } from '../../../model/GradingList';
import { Scheinexam } from '../../../model/Scheinexam';
import { Student } from '../../../model/Student';
import { ROUTES } from '../../../routes/Routing.routes';
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
  [key: string]: string | undefined;
}

function ScheinexamPointsOverview(): JSX.Element {
  const classes = useStyles();

  const navigate   = useNavigate();
  const { tutorialId, examId } = useParams<RouteParams>();

  const { setError } = useErrorSnackbar();

  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Scheinexam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Scheinexam>();
  const [gradings, setGradings] = useState<GradingList>(new GradingList([]));

  useEffect(() => {
    getAllScheinExams()
      .then((response) => {
        setExams(response);
      })
      .catch(() => setError('Scheinklausuren konnten nicht abgerufen werden.'));
  }, [setError]);

  useEffect(() => {
    if (!examId) {
      setSelectedExam(undefined);
      return;
    }

    const newSelected = exams.find((e) => e.id === examId);
    setSelectedExam(newSelected);

    getGradingsOfTutorial(examId, tutorialId)
      .then((response) => setGradings(response))
      .catch(() => {
        setError('Bewertungen konnten nicht abgerufen werden.');
        setGradings(new GradingList([]));
      });
  }, [tutorialId, examId, exams, setError]);

  useEffect(() => {
    getStudentsOfTutorial(tutorialId)
      .then((response) => {
        setStudents(response);
      })
      .catch(() => setError('Scheinklausuren konnten nicht abgerufen werden.'));
  }, [tutorialId, setError]);

  const handleScheinexamSelection = (e: ChangeEvent<{ name?: string; value: unknown }>) => {
    if (typeof e.target.value !== 'string') {
      return;
    }

    const examId: string = e.target.value;
    navigate(ROUTES.SCHEIN_EXAMS_OVERVIEW.create({ tutorialId, examId }));
  };

  return (
    <div className={classes.root}>
      <div className={classes.topBar}>
        <CustomSelect
          label='Scheinklausur wählen'
          emptyPlaceholder='Keine Scheinklausuren vorhanden.'
          className={classes.examSelect}
          items={exams}
          itemToString={(exam) => `Scheinklausur #${exam.scheinExamNo.toString().padStart(2, '0')}`}
          itemToValue={(exam) => exam.id}
          value={selectedExam?.id ?? ''}
          onChange={handleScheinexamSelection}
        />
      </div>

      <Placeholder
        placeholderText='Keine Scheinklausur ausgewählt.'
        showPlaceholder={!selectedExam}
        loading={!!examId && !selectedExam}
      >
        {selectedExam && (
          <StudentCardList
            students={students}
            exam={selectedExam}
            gradings={gradings}
            getPathTo={(student) =>
              ROUTES.SCHEIN_EXAMS_STUDENT.create({
                tutorialId,
                examId: selectedExam.id,
                studentId: student.id,
              })
            }
          />
        )}
      </Placeholder>
    </div>
  );
}

export default ScheinexamPointsOverview;
