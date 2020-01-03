import { CircularProgress, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { Sheet, Exercise } from 'shared/dist/model/Sheet';
import { Team } from 'shared/dist/model/Team';
import BackButton from '../../../components/BackButton';
import CustomSelect from '../../../components/CustomSelect';
import { getSheet } from '../../../hooks/fetching/Sheet';
import { getTeamsOfTutorial } from '../../../hooks/fetching/Team';
import { useErrorSnackbar } from '../../../hooks/useErrorSnackbar';
import { teamItemToString } from '../../../util/helperFunctions';
import {
  getEnterPointsFormPath,
  getPathOfRouteWithTutorial,
} from '../../../util/routing/Routing.helpers';
import { RoutingPath } from '../../../util/routing/Routing.routes';
import EnterPointsForm from './components/EnterPointsForm';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
    },
    topBar: {
      display: 'flex',
      marginBottom: theme.spacing(4),
    },
    titleSpinner: {
      margin: theme.spacing(0, 1),
    },
    backButton: {
      marginRight: theme.spacing(2),
      alignSelf: 'center',
    },
    topBarSelect: {
      marginRight: theme.spacing(1),
      flex: 1,
    },
    enterPointsForm: {
      flex: 1,
    },
  })
);

interface RouteParams {
  tutorialId?: string;
  sheetId?: string;
  teamId?: string;
}

function EnterPoints(): JSX.Element {
  const classes = useStyles();
  const history = useHistory();

  const { tutorialId, sheetId, teamId } = useParams<RouteParams>();
  const { setError } = useErrorSnackbar();

  const [teams, setTeams] = useState<Team[]>([]);
  const [sheet, setSheet] = useState<Sheet>();

  const [selectedTeam, setSelectedTeam] = useState<Team>();
  const [selectedExercise, setSelectedExercise] = useState<Exercise>();

  useEffect(() => {
    if (!tutorialId) {
      return;
    }

    console.log('Fetching teams');

    getTeamsOfTutorial(tutorialId)
      .then(response => {
        setTeams(response);
      })
      .catch(() => setError('Teams konnten nicht abgerufen werden.'));
  }, [tutorialId, setError]);

  useEffect(() => {
    if (!sheetId) {
      return;
    }

    console.log('Fetching sheet');

    getSheet(sheetId)
      .then(response => {
        setSheet(response);
        setSelectedExercise(response.exercises[0]);
      })
      .catch(() => setError('Übungsblatt konnte nicht abgerufen werden.'));
  }, [sheetId, setError]);

  useEffect(() => {
    if (!teamId) {
      return;
    }

    const newSelectedTeam = teams.find(t => t.id === teamId);

    if (newSelectedTeam) {
      setSelectedTeam(newSelectedTeam);
    }
  }, [teams, teamId]);

  const handleExerciseChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    if (!sheet) {
      return;
    }

    const exerciseId: string = event.target.value as string;
    const exercise = sheet.exercises.find(ex => ex.id === exerciseId);

    if (exercise) {
      setSelectedExercise(exercise);
    }
  };

  const handleTeamChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    if (!tutorialId || !sheetId) {
      return;
    }

    const teamId: string = event.target.value as string;

    history.push(getEnterPointsFormPath({ tutorialId, sheetId, teamId }));
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
    <div className={classes.root}>
      <div className={classes.topBar}>
        <BackButton
          to={getPathOfRouteWithTutorial(RoutingPath.ENTER_POINTS_OVERVIEW, tutorialId)}
          className={classes.backButton}
        />

        <Typography variant='h4'>
          Punkte für Übungsblatt{' '}
          {sheet ? (
            `#${sheet.sheetNo}`
          ) : (
            <CircularProgress size={34} className={classes.titleSpinner} color='inherit' />
          )}{' '}
          eintragen
        </Typography>
      </div>

      <div className={classes.topBar}>
        <CustomSelect
          className={classes.topBarSelect}
          label='Aufgabe'
          emptyPlaceholder='Keine Aufgaben verfügbar'
          items={sheet ? sheet.exercises : []}
          itemToString={ex => `Aufgabe ${ex.exName}`}
          itemToValue={ex => ex.id}
          value={selectedExercise?.id ?? ''}
          onChange={handleExerciseChange}
        />

        <CustomSelect
          className={classes.topBarSelect}
          label='Team'
          emptyPlaceholder='Keine Teams verfügbar'
          items={teams}
          itemToString={teamItemToString}
          itemToValue={team => team.id}
          value={selectedTeam?.id ?? ''}
          onChange={handleTeamChange}
        />
      </div>

      {selectedTeam && selectedExercise && (
        <EnterPointsForm
          team={selectedTeam}
          exercise={selectedExercise}
          className={classes.enterPointsForm}
        />
      )}
    </div>
  );
}

export default EnterPoints;
