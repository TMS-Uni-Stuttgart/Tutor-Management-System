import { Typography } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import {
  getTeamOfTutorial,
  getTeamsOfTutorial,
  setPointsOfTeam,
} from '../../../hooks/fetching/Team';
import { useErrorSnackbar } from '../../../hooks/useErrorSnackbar';
import { Team } from '../../../model/Team';
import { getEnterPointsForTeamPath } from '../../../routes/Routing.helpers';
import { PointsFormSubmitCallback } from './components/EnterPointsForm.helpers';
import EnterPoints from './EnterPoints';
import { convertFormStateToPointMap } from './EnterPoints.helpers';

interface RouteParams {
  tutorialId?: string;
  sheetId?: string;
  teamId?: string;
}

function EnterTeamPoints(): JSX.Element {
  const history = useHistory();

  const { tutorialId, sheetId, teamId } = useParams<RouteParams>();
  const { enqueueSnackbar } = useSnackbar();
  const { setError } = useErrorSnackbar();

  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team>();

  useEffect(() => {
    if (!tutorialId) {
      return;
    }

    getTeamsOfTutorial(tutorialId)
      .then(response => {
        setTeams(response);
      })
      .catch(() => setError('Teams konnten nicht abgerufen werden.'));
  }, [tutorialId, setError]);

  useEffect(() => {
    if (!teamId) {
      return;
    }

    const newSelectedTeam = teams.find(t => t.id === teamId);

    if (newSelectedTeam) {
      setSelectedTeam(newSelectedTeam);
    }
  }, [teams, teamId]);

  const handleTeamChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    if (!tutorialId || !sheetId) {
      return;
    }

    const teamId: string = event.target.value as string;

    history.push(getEnterPointsForTeamPath({ tutorialId, sheetId, teamId }));
  };

  const handleSubmit: PointsFormSubmitCallback = async (values, { resetForm }) => {
    if (!sheetId || !tutorialId || !teamId || !selectedTeam) {
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
      await setPointsOfTeam(tutorialId, teamId, updateDTO);
      const updatedTeam = await getTeamOfTutorial(tutorialId, teamId);

      setTeams(teams => teams.map(t => (t.id === teamId ? updatedTeam : t)));

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
      onSubmit={handleSubmit}
      allEntities={teams}
      entitySelectProps={{
        label: 'Teams',
        emptyPlaceholder: 'Keine Teams verfügbar',
        itemToString: team => team.toString(),
        onChange: handleTeamChange,
      }}
    />
  );
}

export default EnterTeamPoints;
