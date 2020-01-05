import { CircularProgress, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { PointMap, UpdatePointsDTO } from 'shared/dist/model/Points';
import { Exercise, Sheet } from 'shared/dist/model/Sheet';
import { Team } from 'shared/dist/model/Team';
import BackButton from '../../../components/BackButton';
import CustomSelect from '../../../components/CustomSelect';
import { getSheet } from '../../../hooks/fetching/Sheet';
import {
  getTeamOfTutorial,
  getTeamsOfTutorial,
  setPointsOfTeam,
} from '../../../hooks/fetching/Team';
import { useErrorSnackbar } from '../../../hooks/useErrorSnackbar';
import { teamItemToString } from '../../../util/helperFunctions';
import {
  getEnterPointsFormPath,
  getPointOverviewPath,
} from '../../../util/routing/Routing.helpers';
import EnterPointsForm from './components/EnterPointsForm';
import { PointsFormSubmitCallback } from './components/EnterPointsForm.helpers';
import { convertFormStateToPointMap } from './EnterPoints.helpers';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
    },
    topBar: {
      display: 'flex',
      marginBottom: theme.spacing(3),
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
  const { enqueueSnackbar } = useSnackbar();
  const { setError } = useErrorSnackbar();

  const [teams, setTeams] = useState<Team[]>([]);
  const [sheet, setSheet] = useState<Sheet>();

  const [selectedTeam, setSelectedTeam] = useState<Team>();
  const [selectedExercise, setSelectedExercise] = useState<Exercise>();

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
    if (!sheetId) {
      return;
    }

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

  const handleSubmit: PointsFormSubmitCallback = async (values, { resetForm }) => {
    if (!sheet || !tutorialId || !teamId || !selectedTeam) {
      return;
    }

    const points: PointMap = convertFormStateToPointMap({
      values,
      sheetId: sheet.id,
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
          .padStart(2, '0')} eintragen fehlgeschlagen.`,
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
    <div className={classes.root}>
      <div className={classes.topBar}>
        <BackButton
          to={getPointOverviewPath({ tutorialId, sheetId })}
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

      {selectedTeam && sheet && selectedExercise && (
        <EnterPointsForm
          key={sheet.id}
          team={selectedTeam}
          sheet={sheet}
          exercise={selectedExercise}
          className={classes.enterPointsForm}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

export default EnterPoints;
