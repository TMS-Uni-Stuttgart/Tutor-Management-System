import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router';
import { Sheet } from 'shared/dist/model/Sheet';
import { Team } from 'shared/dist/model/Team';
import CustomSelect from '../../../components/CustomSelect';
import SubmitButton from '../../../components/forms/components/SubmitButton';
import { getAllSheets } from '../../../hooks/fetching/Sheet';
import { getTeamsOfTutorial } from '../../../hooks/fetching/Team';
import { useErrorSnackbar } from '../../../hooks/useErrorSnackbar';
import { usePDFs } from '../../../hooks/usePDFs';
import Placeholder from './components/Placeholder';
import TeamCardList from './components/TeamCardList';
import { getPointOverviewPath } from '../../../util/routing/Routing.helpers';

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
  sheetId?: string;
  tutorialId?: string;
}

enum PDFGeneratingState {
  NONE,
  SINGLE,
  MULTIPLE,
}

function PointsOverview(): JSX.Element {
  const classes = useStyles();

  const history = useHistory();
  const { tutorialId, sheetId } = useParams<RouteParams>();

  const { setError } = useErrorSnackbar();
  const { enqueueSnackbar } = useSnackbar();

  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  const [currentSheet, setCurrentSheet] = useState<Sheet | undefined>();

  const { showSinglePdfPreview, generateSinglePdf, generateAllPdfs } = usePDFs();

  const [isGeneratingPDFs, setGeneratingPDFs] = useState<PDFGeneratingState>(
    PDFGeneratingState.NONE
  );

  useEffect(() => {
    if (!tutorialId) {
      setError('Es wurde keine Tutoriums ID über den Pfad mitgegeben.');

      return;
    }

    Promise.all([getAllSheets(), getTeamsOfTutorial(tutorialId)])
      .then(([sheetResponse, teamResponse]) => {
        setError(undefined);

        setSheets(sheetResponse);
        setTeams(teamResponse);
      })
      .catch(() => setError('Daten konnten nicht abgerufen werden.'));
  }, [tutorialId, setError]);

  useEffect(() => {
    if (currentSheet?.id === sheetId) {
      return;
    }

    if (!!sheetId) {
      setCurrentSheet(sheets.find(s => s.id === sheetId));
    } else {
      setCurrentSheet(undefined);
    }
  }, [sheets, sheetId]);

  function onSheetSelection(e: ChangeEvent<{ name?: string; value: unknown }>) {
    if (!tutorialId || typeof e.target.value !== 'string') {
      return;
    }

    const sheetId: string = e.target.value;
    history.push(getPointOverviewPath({ tutorialId, sheetId }));
  }

  async function handlePdfPreviewClicked(team: Team) {
    if (!currentSheet || !tutorialId) {
      return;
    }

    try {
      await showSinglePdfPreview({ tutorialId, sheet: currentSheet, team });
    } catch {
      enqueueSnackbar('Preview konnte nicht geladen werden.', { variant: 'error' });
    }
  }

  async function handleGenerateSinglePdf(team: Team) {
    if (!currentSheet || !tutorialId) {
      return;
    }

    try {
      setGeneratingPDFs(PDFGeneratingState.SINGLE);

      await generateSinglePdf({ tutorialId, sheet: currentSheet, team });
    } catch {
      enqueueSnackbar('PDF konnte nicht erstellt werden.', { variant: 'error' });
    } finally {
      setGeneratingPDFs(PDFGeneratingState.NONE);
    }
  }

  async function handleGeneratingAllPDFs() {
    if (!currentSheet || !tutorialId) {
      return;
    }

    try {
      setGeneratingPDFs(PDFGeneratingState.MULTIPLE);

      await generateAllPdfs({ tutorialId, sheet: currentSheet });
    } catch {
      enqueueSnackbar('PDFs konnten nicht erstellt werden.', { variant: 'error' });
    } finally {
      setGeneratingPDFs(PDFGeneratingState.NONE);
    }
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
          modalText={
            isGeneratingPDFs === PDFGeneratingState.SINGLE ? 'Erstelle PDF...' : 'Erstelle PDFs...'
          }
        >
          PDFs erstellen
        </SubmitButton>
      </div>

      <Placeholder placeholderText='Kein Blatt ausgewählt.' showPlaceholder={!currentSheet}>
        {currentSheet && tutorialId && (
          <TeamCardList
            tutorialId={tutorialId}
            teams={teams}
            sheet={currentSheet}
            onPdfPreviewClicked={handlePdfPreviewClicked}
            onGeneratePdfClicked={handleGenerateSinglePdf}
          />
        )}
      </Placeholder>
    </div>
  );
}

export default PointsOverview;
