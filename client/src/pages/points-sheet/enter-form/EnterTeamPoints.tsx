import { SelectChangeEvent, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useMatches, useNavigate, useParams } from 'react-router';
import { getGradingsOfTutorial } from '../../../hooks/fetching/Grading';
import {
  getTeamOfTutorial,
  getTeamsOfTutorial,
  setPointsOfTeam,
} from '../../../hooks/fetching/Team';
import { useCustomSnackbar } from '../../../hooks/snackbar/useCustomSnackbar';
import { GradingList } from '../../../model/GradingList';
import { Team } from '../../../model/Team';
import { useTutorialRoutes } from '../../../routes/Routing.routes';
import { PointsFormSubmitCallback } from './components/EnterPointsForm.helpers';
import EnterPoints from './EnterPoints';
import { convertFormStateToGradingDTO } from './EnterPoints.helpers';

interface RouteParams {
  tutorialId?: string;
  sheetId?: string;
  teamId?: string;
  [key: string]: string | undefined;
}

function EnterTeamPoints(): JSX.Element {
  const navigate = useNavigate();

  const { tutorialId, sheetId, teamId } = useParams<RouteParams>();
  const { enqueueSnackbar, setError } = useCustomSnackbar();
  const matches = useMatches();

  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team>();
  const [gradings, setGradings] = useState<GradingList>(new GradingList([]));
  const isAutoSubmittingRef = React.useRef<boolean>(false);

  useEffect(() => {
    if (!tutorialId) {
      return;
    }

    getTeamsOfTutorial(tutorialId)
      .then((response) => {
        setTeams(response);
      })
      .catch(() => setError('Teams konnten nicht abgerufen werden.'));
  }, [tutorialId, sheetId, setError]);

  useEffect(() => {
    if (!teamId || !tutorialId) {
      return;
    }

    const newSelectedTeam = teams.find((t) => t.id === teamId);

    if (newSelectedTeam) {
      setSelectedTeam(newSelectedTeam);
    }

    if (sheetId) {
      getGradingsOfTutorial(sheetId, tutorialId)
        .then((response) => setGradings(response))
        .catch(() => {
          setError('Bewertungen konnten nicht abgerufen werden.');
          setGradings(new GradingList([]));
        });
    }
  }, [teams, teamId]);

  const handleTeamChange = (event: SelectChangeEvent<unknown>, child: React.ReactNode) => {
    if (!tutorialId || !sheetId) {
      return;
    }

    const teamId: string = event.target.value as string;

    navigate(
      useTutorialRoutes(matches).ENTER_POINTS_TEAM.buildPath({ tutorialId, sheetId, teamId })
    );
  };

  const handleSubmit: PointsFormSubmitCallback = async (values, { resetForm }) => {
    if (!sheetId || !tutorialId || !teamId || !selectedTeam) {
      return;
    }

    const prevGrading = gradings.getOfTeam(selectedTeam);
    const updateDTO = convertFormStateToGradingDTO({
      values,
      sheetId,
      prevGrading,
    });

    try {
      await setPointsOfTeam(tutorialId, teamId, updateDTO);
      const updatedTeam = await getTeamOfTutorial(tutorialId, teamId);

      setTeams((teams) => teams.map((t) => (t.id === teamId ? updatedTeam : t)));

      resetForm({ values: { ...values } });

      if (!isAutoSubmittingRef.current) {
        enqueueSnackbar(
          `Punkte für Team #${selectedTeam.teamNo
            .toString()
            .padStart(2, '0')} erfolgreich eingetragen.`,
          { variant: 'success' }
        );
      }
    } catch {
      enqueueSnackbar(
        `Punkte für Team #${selectedTeam.teamNo
          .toString()
          .padStart(2, '0')} konnten nicht eingetragen werden.`,
        { variant: 'error' }
      );
    } finally {
      setIsAutoSubmitting(false);
    }
  };

  const setIsAutoSubmitting = (value: boolean) => {
    isAutoSubmittingRef.current = value;
  };

  if (!tutorialId || !sheetId || !teamId) {
    return (
      <Typography color='error'>
        At least one of the three required params <code>tutorialId, sheetId, teamId</code> was not
        provided through path params.
      </Typography>
    );
  }

  return (
    <EnterPoints
      tutorialId={tutorialId}
      sheetId={sheetId}
      entity={selectedTeam}
      grading={selectedTeam === undefined ? undefined : gradings.getOfTeam(selectedTeam)}
      onSubmit={handleSubmit}
      setIsAutoSubmitting={setIsAutoSubmitting}
      allEntities={teams}
      entitySelectProps={{
        label: 'Teams',
        emptyPlaceholder: 'Keine Teams verfügbar',
        itemToString: (team) => team.toString(),
        onChange: handleTeamChange,
      }}
    />
  );
}

export default EnterTeamPoints;
