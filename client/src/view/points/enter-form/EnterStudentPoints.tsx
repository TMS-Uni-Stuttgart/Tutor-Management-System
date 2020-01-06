import { Typography } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Student } from 'shared/dist/model/Student';
import { getNameOfEntity } from 'shared/dist/util/helpers';
import { getStudent, setPointsOfStudent } from '../../../hooks/fetching/Student';
import { useErrorSnackbar } from '../../../hooks/useErrorSnackbar';
import { PointsFormSubmitCallback } from './components/EnterPointsForm.helpers';
import EnterPoints from './EnterPoints';
import { PointMap, UpdatePointsDTO } from 'shared/dist/model/Points';
import { convertFormStateToPointMap } from './EnterPoints.helpers';

interface RouteParams {
  tutorialId?: string;
  sheetId?: string;
  studentId?: string;
}

function EnterStudentPoints(): JSX.Element {
  const { tutorialId, sheetId, studentId } = useParams<RouteParams>();
  const { enqueueSnackbar } = useSnackbar();
  const { setError } = useErrorSnackbar();

  const [student, setStudent] = useState<Student>();

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

  const handleSubmit: PointsFormSubmitCallback = async (values, { resetForm }) => {
    if (!sheetId || !tutorialId || !studentId || !student) {
      return;
    }

    const points: PointMap = convertFormStateToPointMap({
      values,
      sheetId: sheetId,
    });
    const updateDTO: UpdatePointsDTO = {
      points: points.toDTO(),
    };

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

  if (!tutorialId || !sheetId || !studentId) {
    return (
      <Typography color='error'>
        At least one of the three required params <code>tutorialId, sheetId, studentId</code> was
        not provided through path params.
      </Typography>
    );
  }

  return (
    <EnterPoints
      tutorialId={tutorialId}
      sheetId={sheetId}
      entity={student}
      onSubmit={handleSubmit}
      allEntities={!!student ? [student] : []}
      entitySelectProps={{
        label: 'Student',
        emptyPlaceholder: 'Keine Studierenden verfügbar.',
        itemToString: s => getNameOfEntity(s),
      }}
    />
  );
}

export default EnterStudentPoints;
