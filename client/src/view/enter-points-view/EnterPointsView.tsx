import { Switch } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { Sheet } from 'shared/dist/model/Sheet';
import CustomSelect from '../../components/CustomSelect';
import SubmitButton from '../../components/forms/components/SubmitButton';
import { getAllSheets } from '../../hooks/fetching/Sheet';
import Placeholder from './components/Placeholder';
import { useParams } from 'react-router';
import TeamCardList from './components/TeamCardList';
import { Team } from 'shared/dist/model/Team';
import { getTeamsOfTutorial } from '../../hooks/fetching/Team';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
    },
    topBar: {
      display: 'flex',
      marginBottom: theme.spacing(2),
      alignItems: 'center',
    },
    sheetSelect: {
      flex: 1,
      marginRight: theme.spacing(1),
    },
    createPdfsButton: {
      height: '100%',
      marginRight: theme.spacing(1),
    },
  })
);

interface RouteParams {
  tutorialId?: string;
}

enum PDFGeneratingState {
  NONE,
  SINGLE,
  MULTIPLE,
}

function duplicateArray<T>(array: T[], times: number = 5): T[] {
  const duplicatedArray: T[] = [];

  for (let i = 0; i < times; i++) {
    duplicatedArray.push(...array);
  }

  return duplicatedArray;
}

function EnterPointsView(): JSX.Element {
  const classes = useStyles();

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { tutorialId } = useParams<RouteParams>();

  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  const [currentSheet, setCurrentSheet] = useState<Sheet | undefined>(undefined);

  const [isGeneratingPDFs, setGeneratingPDFs] = useState<PDFGeneratingState>(
    PDFGeneratingState.NONE
  );

  useEffect(() => {
    if (!tutorialId) {
      const snackbar = enqueueSnackbar('Es wurde keine Tutoriums ID über den Pfad mitgegeben.', {
        variant: 'error',
        persist: true,
      });

      return () => {
        if (!!snackbar) {
          closeSnackbar(snackbar);
        }
      };
    }

    Promise.all([getAllSheets(), getTeamsOfTutorial(tutorialId)])
      .then(([sheetResponse, teamResponse]) => {
        setSheets(sheetResponse);
        setTeams(teamResponse);

        // FIXME: REMOVE ME -- DEBUG CODE!
        setCurrentSheet(sheetResponse[0]);
      })
      .catch(() => enqueueSnackbar('Daten konnten nicht abgerufen werden', { variant: 'error' }));
  }, [tutorialId, enqueueSnackbar, closeSnackbar]);

  function onSheetSelection(e: ChangeEvent<{ name?: string; value: unknown }>) {
    if (typeof e.target.value !== 'string') {
      return;
    }

    const sheet: Sheet | undefined = sheets.find(s => s.id === e.target.value);
    setCurrentSheet(sheet);
  }

  async function handleGeneratingAllPDFs() {
    // FIXME: Implement me!
    setGeneratingPDFs(PDFGeneratingState.MULTIPLE);

    setTimeout(() => setGeneratingPDFs(PDFGeneratingState.NONE), 5000);
  }

  return (
    <div className={classes.root}>
      <div className={classes.topBar}>
        <CustomSelect
          label='Blatt wählen'
          emptyPlaceholder='Keine Bätter vorhanden.'
          className={classes.sheetSelect}
          items={sheets}
          itemToString={sheet => `Übungsblatt #${sheet.sheetNo.toString().padStart(2, '0')}`}
          itemToValue={sheet => sheet.id}
          value={currentSheet ? currentSheet.id : ''}
          onChange={onSheetSelection}
        />

        <SubmitButton
          isSubmitting={isGeneratingPDFs !== PDFGeneratingState.NONE}
          variant='outlined'
          color='default'
          className={classes.createPdfsButton}
          onClick={handleGeneratingAllPDFs}
          disabled={!currentSheet}
          modalText={PDFGeneratingState.SINGLE ? 'Erstelle PDF...' : 'Erstelle PDFs...'}
        >
          PDFs erstellen
        </SubmitButton>

        <Switch />
      </div>

      <Placeholder placeholderText='Kein Blatt ausgewählt.' showPlaceholder={!currentSheet}>
        {/* FIXME: REMOVE DUPLICATES! */}
        <TeamCardList teams={duplicateArray(teams, 8)} />
      </Placeholder>
    </div>
  );
}

export default EnterPointsView;
