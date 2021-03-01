import { Box } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { IPresentationPointsDTO } from 'shared/model/Gradings';
import Placeholder from '../../components/Placeholder';
import { useSheetSelector } from '../../components/sheet-selector/SheetSelector';
import { getStudent, setPresentationPointsOfStudent } from '../../hooks/fetching/Student';
import { getStudentsOfTutorial } from '../../hooks/fetching/Tutorial';
import { useErrorSnackbar } from '../../hooks/snackbar/useErrorSnackbar';
import { Student } from '../../model/Student';
import { ROUTES } from '../../routes/Routing.routes';
import PresentationList from './components/PresentationList';

interface RouteParams {
  sheetId?: string;
  tutorialId?: string;
}

function PresentationPoints(): JSX.Element {
  const { tutorialId } = useParams<RouteParams>();

  const { setError } = useErrorSnackbar();
  const { SheetSelector, currentSheet, isLoadingSheets } = useSheetSelector({
    generatePath: ({ sheetId }) => {
      if (!tutorialId) {
        throw new Error('The path needs to contain a tutorialId parameter.');
      }

      return ROUTES.PRESENTATION_POINTS.create({ tutorialId, sheetId });
    },
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if (!tutorialId) {
      setError('Es wurde keine Tutoriums ID über den Pfad mitgegeben.');

      return;
    }

    setLoading(true);

    getStudentsOfTutorial(tutorialId)
      .then((students) => {
        setStudents(students);
      })
      .catch(() => setError('Studierende konnte nicht abgerufen werden.'))
      .finally(() => setLoading(false));
  }, [tutorialId, setError]);

  async function handleSubmit(student: Student, points: number) {
    if (!currentSheet || Number.isNaN(points)) {
      return;
    }

    const dto: IPresentationPointsDTO = {
      points,
      sheetId: currentSheet.id,
    };

    await setPresentationPointsOfStudent(student.id, dto);

    const updatedStudent = await getStudent(student.id);
    setStudents((students) => students.map((st) => (st.id === student.id ? updatedStudent : st)));
  }

  return (
    <Box display='flex' flexDirection='column'>
      <Box display='flex' marginBottom={2} alignItems='center'>
        <SheetSelector />
      </Box>

      <Placeholder
        placeholderText='Kein Blatt ausgewählt'
        showPlaceholder={!currentSheet}
        loading={isLoading || isLoadingSheets}
      >
        {currentSheet && (
          <PresentationList students={students} sheet={currentSheet} onSubmit={handleSubmit} />
        )}
      </Placeholder>
    </Box>
  );
}

export default PresentationPoints;
