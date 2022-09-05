import { Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import {
  getTeamOfTutorial,
  getTeamsOfTutorial,
  setPointsOfTeam,
} from '../../../hooks/fetching/Team';
import { useCustomSnackbar } from '../../../hooks/snackbar/useCustomSnackbar';
import { Team } from '../../../model/Team';
import { ROUTES } from '../../../routes/Routing.routes';
import { PointsFormSubmitCallback } from './components/EnterPointsForm.helpers';
import EnterPoints from './EnterPoints';
import { convertFormStateToGradingDTO } from './EnterPoints.helpers';
import { GradingList } from '../../../model/GradingList';
import { getGradingsOfTutorial } from '../../../hooks/fetching/Grading';

interface RouteParams {
  tutorialId?: string;
  sheetId?: string;
  teamId?: string;
}

function EnterTeamPoints(): JSX.Element {
  const history = useHistory();

  const { tutorialId, sheetId, teamId } = useParams<RouteParams>();
  const { enqueueSnackbar, setError } = useCustomSnackbar();

  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team>();
  const [gradings, setGradings] = useState<GradingList>(new GradingList([]));

  useEffect(() => {
    if (!tutorialId) {
      return;
    }

    getTeamsOfTutorial(tutorialId)
      .then((response) => {
        setTeams(response);
      })
      .catch(() => setError('Teams konnten nicht abgerufen werden.'));

    if (!!sheetId) {
      getGradingsOfTutorial(sheetId, tutorialId)
        .then((response) => setGradings(response))
        .catch(() => {
          setError('Bewertungen konnten nicht abgerufen werden.');
          setGradings(new GradingList([]));
        });
    }
  }, [tutorialId, sheetId, setError]);

  useEffect(() => {
    if (!teamId) {
      return;
    }

    const newSelectedTeam = teams.find((t) => t.id === teamId);

    if (newSelectedTeam) {
      setSelectedTeam(newSelectedTeam);
    }
  }, [teams, teamId]);

  const handleTeamChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    if (!tutorialId || !sheetId) {
      return;
    }

    const teamId: string = event.target.value as string;

    history.push(ROUTES.ENTER_POINTS_TEAM.create({ tutorialId, sheetId, teamId }));
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
      enqueueSnackbar(
        `Punkte für Team #${selectedTeam.teamNo
          .toString()
          .padStart(2, '0')} erfolgreich eingetragen.`,
        { variant: 'success' }
      );
    } catch {
      enqueueSnackbar(
        `Punkte für Team #${selectedTeam.teamNo
          .toString()
          .padStart(2, '0')} konnten nicht eingetragen werden.`,
        { variant: 'error' }
      );
    }
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
