import { Typography } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { getNameOfEntity } from 'shared/util/helpers';
import { IGradingDTO } from '../../../../../server/src/shared/model/Points';
import { getStudent, setPointsOfStudent } from '../../../hooks/fetching/Student';
import { getTeamOfTutorial } from '../../../hooks/fetching/Team';
import { useErrorSnackbar } from '../../../hooks/useErrorSnackbar';
import { Student } from '../../../model/Student';
import { Team } from '../../../model/Team';
import { getEnterPointsForStudentPath } from '../../../routes/Routing.helpers';
import { PointsFormSubmitCallback } from './components/EnterPointsForm.helpers';
import EnterPoints from './EnterPoints';
import { convertFormStateToGradingDTO } from './EnterPoints.helpers';

interface RouteParams {
  tutorialId?: string;
  sheetId?: string;
  teamId?: string;
  studentId?: string;
}

function EnterStudentPoints(): JSX.Element {
  const history = useHistory();
  const { tutorialId, sheetId, teamId, studentId } = useParams<RouteParams>();

  const { enqueueSnackbar } = useSnackbar();
  const { setError } = useErrorSnackbar();

  const [student, setStudent] = useState<Student>();
  const [team, setTeam] = useState<Team>();

  useEffect(() => {
    if (!studentId) {
      return;
    }

    getStudent(studentId)
      .then(response => {
        setStudent(response);
      })
      .catch(() => setError('Studierende/r konnte nicht abgerufen werden.'));
  }, [studentId, setError]);

  useEffect(() => {
    if (!tutorialId || !teamId) {
      return;
    }

    getTeamOfTutorial(tutorialId, teamId)
      .then(response => {
        setTeam(response);
      })
      .catch(() => setError('Team konnte nicht abgerufen werden.'));
  });

  if (!tutorialId || !sheetId || !studentId || !teamId) {
    return (
      <Typography color='error'>
        At least one of the three required params <code>tutorialId, sheetId, studentId</code> was
        not provided through path params.
      </Typography>
    );
  }

  const handleStudentChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    if (!tutorialId || !sheetId || !teamId) {
      return;
    }

    const studentId: string = event.target.value as string;

    history.push(getEnterPointsForStudentPath({ tutorialId, sheetId, teamId, studentId }));
  };

  const handleSubmit: PointsFormSubmitCallback = async (values, { resetForm }) => {
    if (!sheetId || !tutorialId || !studentId || !student) {
      return;
    }

    const prevGrading = student.getGrading(sheetId);
    const updateDTO: IGradingDTO = convertFormStateToGradingDTO({
      values,
      entityId: sheetId,
      prevGrading,
    });

    try {
      await setPointsOfStudent(studentId, updateDTO);
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

  const allStudents: Student[] = team ? team.students : student ? [student] : [];

  return (
    <EnterPoints
      tutorialId={tutorialId}
      sheetId={sheetId}
      entity={student}
      onSubmit={handleSubmit}
      allEntities={allStudents}
      entitySelectProps={{
        label: 'Student',
        emptyPlaceholder: 'Keine Studierenden verfügbar.',
        itemToString: s => getNameOfEntity(s),
        onChange: handleStudentChange,
      }}
    />
  );
}

export default EnterStudentPoints;
