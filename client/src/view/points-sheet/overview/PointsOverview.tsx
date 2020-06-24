import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import SubmitButton from '../../../components/loading/SubmitButton';
import Placeholder from '../../../components/Placeholder';
import { getTeamsOfTutorial } from '../../../hooks/fetching/Team';
import { useErrorSnackbar } from '../../../hooks/useErrorSnackbar';
import { usePDFs } from '../../../hooks/usePDFs';
import { Team } from '../../../model/Team';
import { getPointOverviewPath } from '../../../routes/Routing.helpers';
import { useSheetSelector } from '../../../components/sheet-selector/SheetSelector';
import TeamCardList from './components/TeamCardList';

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
  const { tutorialId } = useParams<RouteParams>();

  const { SheetSelector, currentSheet, isLoadingSheets } = useSheetSelector({
    generatePath: ({ sheetId }) => {
      if (!tutorialId) {
        throw new Error('The path needs to contain a tutorialId parameter.');
      }

      return getPointOverviewPath({ tutorialId, sheetId });
    },
  });

  const { setError } = useErrorSnackbar();
  const { enqueueSnackbar } = useSnackbar();

  const [teams, setTeams] = useState<Team[]>([]);

  const { showSinglePdfPreview, generateSinglePdf, generateAllPdfs } = usePDFs();

  const [isGeneratingPDFs, setGeneratingPDFs] = useState<PDFGeneratingState>(
    PDFGeneratingState.NONE
  );

  useEffect(() => {
    if (!tutorialId) {
      setError('Es wurde keine Tutoriums ID über den Pfad mitgegeben.');

      return;
    }

    getTeamsOfTutorial(tutorialId)
      .then((teamResponse) => {
        setError(undefined);

        setTeams(teamResponse);
      })
      .catch(() => setError('Daten konnten nicht abgerufen werden.'));
  }, [tutorialId, setError]);

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
        <SheetSelector className={classes.sheetSelect} />

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

      <Placeholder
        placeholderText='Kein Blatt ausgewählt.'
        showPlaceholder={!currentSheet}
        loading={isLoadingSheets}
      >
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
