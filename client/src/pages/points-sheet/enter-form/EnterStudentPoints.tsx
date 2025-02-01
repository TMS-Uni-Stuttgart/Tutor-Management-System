import { SelectChangeEvent, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useMatches, useNavigate, useParams } from 'react-router';
import { IGradingDTO } from 'shared/model/Gradings';
import { getGradingsOfTutorial } from '../../../hooks/fetching/Grading';
import { getStudent, setPointsOfStudent } from '../../../hooks/fetching/Student';
import { getTeamOfTutorial } from '../../../hooks/fetching/Team';
import { useCustomSnackbar } from '../../../hooks/snackbar/useCustomSnackbar';
import { GradingList } from '../../../model/GradingList';
import { Student, StudentInTeam } from '../../../model/Student';
import { Team } from '../../../model/Team';
import { useTutorialRoutes } from '../../../routes/Routing.routes';
import { PointsFormSubmitCallback } from './components/EnterPointsForm.helpers';
import EnterPoints from './EnterPoints';
import { convertFormStateToGradingDTO } from './EnterPoints.helpers';

interface RouteParams {
  tutorialId?: string;
  sheetId?: string;
  teamId?: string;
  studentId?: string;
  [key: string]: string | undefined;
}

function EnterStudentPoints(): JSX.Element {
  const navigate = useNavigate();
  const { tutorialId, sheetId, teamId, studentId } = useParams<RouteParams>();

  const { enqueueSnackbar, setError } = useCustomSnackbar();

  const [student, setStudent] = useState<Student>();
  const [team, setTeam] = useState<Team>();
  const [gradings, setGradings] = useState<GradingList>(new GradingList([]));
  const isAutoSubmittingRef = React.useRef<boolean>(false);
  const matches = useMatches();

  useEffect(() => {
    if (!studentId) {
      return;
    }

    getStudent(studentId)
      .then((response) => {
        setStudent(response);
      })
      .catch(() => setError('Studierende/r konnte nicht abgerufen werden.'));
  }, [studentId, setError]);

  useEffect(() => {
    if (!tutorialId || !teamId) {
      return;
    }

    getTeamOfTutorial(tutorialId, teamId)
      .then((response) => {
        setTeam(response);
      })
      .catch(() => setError('Team konnte nicht abgerufen werden.'));

    if (sheetId) {
      getGradingsOfTutorial(sheetId, tutorialId)
        .then((response) => setGradings(response))
        .catch(() => {
          setError('Bewertungen konnten nicht abgerufen werden.');
          setGradings(new GradingList([]));
        });
    }
  }, [sheetId, tutorialId, teamId, setError]);

  if (!tutorialId || !sheetId || !studentId || !teamId) {
    return (
      <Typography color='error'>
        At least one of the three required params <code>tutorialId, sheetId, studentId</code> was
        not provided through path params.
      </Typography>
    );
  }

  const handleStudentChange = (event: SelectChangeEvent<unknown>) => {
    if (!tutorialId || !sheetId || !teamId) {
      return;
    }

    const studentId: string = event.target.value as string;

    navigate(
      useTutorialRoutes(matches).ENTER_POINTS_STUDENT.buildPath({
        tutorialId,
        sheetId,
        teamId,
        studentId,
      })
    );
  };

  const handleSubmit: PointsFormSubmitCallback = async (values, { resetForm }) => {
    if (!sheetId || !tutorialId || !studentId || !student) {
      return;
    }

    const prevGrading = gradings.getOfStudent(student.id);
    const teamGrading = team === undefined ? undefined : gradings.getOfTeam(team);

    const updateDTO: IGradingDTO = convertFormStateToGradingDTO({
      values,
      sheetId,
      prevGrading: teamGrading?.id === prevGrading?.id ? undefined : prevGrading,
    });

    try {
      await setPointsOfStudent(studentId, updateDTO);
      const updatedStudent = await getStudent(studentId);

      setStudent(updatedStudent);

      resetForm({ values: { ...values } });
      if (!isAutoSubmittingRef.current) {
        enqueueSnackbar(`Punkte für ${student.nameFirstnameFirst} erfolgreich eingetragen.`, {
          variant: 'success',
        });
      }
    } catch {
      enqueueSnackbar(
        `Punkte für ${student.nameFirstnameFirst} konnten nicht eingetragen werden.`,
        {
          variant: 'error',
        }
      );
    } finally {
      setIsAutoSubmitting(false);
    }
  };

  const setIsAutoSubmitting = (value: boolean) => {
    isAutoSubmittingRef.current = value;
  };

  const allStudents: StudentInTeam[] = team ? team.students : student ? [student] : [];

  return (
    <EnterPoints
      tutorialId={tutorialId}
      sheetId={sheetId}
      entity={student}
      grading={student === undefined ? undefined : gradings.getOfStudent(student.id)}
      onSubmit={handleSubmit}
      setIsAutoSubmitting={setIsAutoSubmitting}
      allEntities={allStudents}
      entitySelectProps={{
        label: 'Student',
        emptyPlaceholder: 'Keine Studierenden verfügbar.',
        itemToString: (s) => s.name,
        onChange: handleStudentChange,
      }}
    />
  );
}

export default EnterStudentPoints;
