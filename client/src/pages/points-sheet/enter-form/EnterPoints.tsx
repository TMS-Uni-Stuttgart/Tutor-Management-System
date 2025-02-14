import { CircularProgress, SelectChangeEvent, Typography } from '@mui/material';
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import React, { useEffect, useState } from 'react';
import { useMatches } from 'react-router';
import { HasId } from 'shared/model/Common';
import BackButton from '../../../components/back-button/BackButton';
import CustomSelect, { CustomSelectProps } from '../../../components/CustomSelect';
import Placeholder from '../../../components/Placeholder';
import { getSheet } from '../../../hooks/fetching/Sheet';
import { useErrorSnackbar } from '../../../hooks/snackbar/useErrorSnackbar';
import { Exercise } from '../../../model/Exercise';
import { Grading } from '../../../model/Grading';
import { Sheet } from '../../../model/Sheet';
import { useTutorialRoutes } from '../../../routes/Routing.routes';
import EnterPointsForm from './components/EnterPointsForm';
import { PointsFormSubmitCallback } from './components/EnterPointsForm.helpers';

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
      '&:last-of-type': {
        marginRight: 0,
      },
    },
    enterPointsForm: {
      flex: 1,
    },
  })
);

interface EntitySelectProps<T extends HasId> {
  label: string;
  emptyPlaceholder: string;
  itemToString: CustomSelectProps<T>['itemToString'];
  onChange?: CustomSelectProps<T>['onChange'];
}

interface Props<T extends HasId> {
  tutorialId: string;
  sheetId: string;
  entity?: T;
  grading: Grading | undefined;
  onSubmit: PointsFormSubmitCallback;
  setIsAutoSubmitting: (isAutoSubmitting: boolean) => void;
  allEntities: T[];
  entitySelectProps: EntitySelectProps<T>;
}

function EnterPoints<T extends HasId>({
  tutorialId,
  sheetId,
  entity,
  grading,
  onSubmit,
  setIsAutoSubmitting,
  allEntities,
  entitySelectProps,
}: Props<T>): JSX.Element {
  const classes = useStyles();

  const { setError } = useErrorSnackbar();

  const [sheet, setSheet] = useState<Sheet>();
  const [selectedExercise, setSelectedExercise] = useState<Exercise[]>();
  const matches = useMatches();

  useEffect(() => {
    if (!sheetId) {
      return;
    }

    getSheet(sheetId)
      .then((response) => {
        setSheet(response);

        const savedSelection = localStorage.getItem('selectedExercise');
        if (savedSelection === 'all') {
          setSelectedExercise([...response.exercises]);
        } else {
          setSelectedExercise([response.exercises[0]]);
        }
      })
      .catch(() => setError('Übungsblatt konnte nicht abgerufen werden.'));
  }, [sheetId, setError]);

  const handleExerciseChange = (event: SelectChangeEvent<unknown>, child: React.ReactNode) => {
    if (!sheet) {
      return;
    }

    const exerciseId: string = event.target.value as string;
    let exercise: Exercise[] = [];
    const foundExercise = sheet.exercises.find((ex) => ex.id === exerciseId);

    if (foundExercise) {
      exercise = [foundExercise];
      localStorage.setItem('selectedExercise', exerciseId);
    } else {
      exercise = [...sheet.exercises];
      localStorage.setItem('selectedExercise', 'all');
    }

    if (exercise) {
      setSelectedExercise(exercise);
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.topBar}>
        <BackButton
          to={useTutorialRoutes(matches).ENTER_POINTS_OVERVIEW.buildPath({ tutorialId, sheetId })}
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
          items={
            sheet
              ? sheet.exercises.length > 1
                ? [sheet.exercises, ...sheet.exercises.map((ex) => [ex])]
                : [sheet.exercises]
              : []
          }
          itemToString={(ex) => (ex.length > 1 ? 'Alle Aufgaben' : `Aufgabe ${ex[0].exName}`)}
          itemToValue={(ex) => (ex.length > 1 ? ex.map((e) => e.id).join('') : ex[0].id)}
          value={
            selectedExercise && selectedExercise.length > 1
              ? selectedExercise.map((ex) => ex.id).join('')
              : (selectedExercise?.[0]?.id ?? '')
          }
          onChange={handleExerciseChange}
        />

        <CustomSelect
          className={classes.topBarSelect}
          items={allEntities}
          itemToValue={(item) => item.id}
          value={entity?.id ?? ''}
          {...entitySelectProps}
        />
      </div>

      <Placeholder
        placeholderText='Es muss zuerst eine Aufgabe ausgewählt werden.'
        showPlaceholder={!selectedExercise}
        loading={!sheet || !entity}
      >
        {entity && sheet && selectedExercise && (
          <EnterPointsForm
            key={sheet.id}
            grading={grading}
            sheet={sheet}
            exercise={selectedExercise}
            className={classes.enterPointsForm}
            onSubmit={onSubmit}
            setIsAutoSubmitting={setIsAutoSubmitting}
          />
        )}
      </Placeholder>
    </div>
  );
}

export default EnterPoints;
