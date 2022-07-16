import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import SubmitButton from '../../../components/loading/SubmitButton';
import Placeholder from '../../../components/Placeholder';
import { useSheetSelector } from '../../../components/sheet-selector/SheetSelector';
import { getTeamsOfTutorial } from '../../../hooks/fetching/Team';
import { useCustomSnackbar } from '../../../hooks/snackbar/useCustomSnackbar';
import { usePDFs } from '../../../hooks/usePDFs';
import { Team } from '../../../model/Team';
import { ROUTES } from '../../../routes/Routing.routes';
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

enum LoadingState {
  NONE,
  SINGLE,
  MULTIPLE,
  PREVIEW,
}

function getGenerationModalText(state: LoadingState): string {
  switch (state) {
    case LoadingState.SINGLE:
      return 'Erstelle PDF...';
    case LoadingState.MULTIPLE:
      return 'Erstelle PDFs...';
    case LoadingState.PREVIEW:
      return 'Erstelle Vorschau...';
    default:
      return '';
  }
}

function PointsOverview(): JSX.Element {
  const classes = useStyles();
  const { tutorialId } = useParams<RouteParams>();

  const { SheetSelector, currentSheet, isLoadingSheets } = useSheetSelector({
    generatePath: ({ sheetId }) => {
      if (!tutorialId) {
        throw new Error('The path needs to contain a tutorialId parameter.');
      }

      return ROUTES.ENTER_POINTS_OVERVIEW.create({ tutorialId, sheetId });
    },
  });

  const { enqueueSnackbar, setError } = useCustomSnackbar();
  const { showSinglePdfPreview, generateSinglePdf, generateAllPdfs } = usePDFs();

  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.NONE);

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
      setLoadingState(LoadingState.PREVIEW);
      await showSinglePdfPreview({ tutorialId, sheet: currentSheet, team });
    } catch {
      enqueueSnackbar('Preview konnte nicht geladen werden.', { variant: 'error' });
    } finally {
      setLoadingState(LoadingState.NONE);
    }
  }

  async function handleGenerateSinglePdf(team: Team) {
    if (!currentSheet || !tutorialId) {
      return;
    }

    try {
      setLoadingState(LoadingState.SINGLE);

      await generateSinglePdf({ tutorialId, sheet: currentSheet, team });
    } catch {
      enqueueSnackbar('PDF konnte nicht erstellt werden.', { variant: 'error' });
    } finally {
      setLoadingState(LoadingState.NONE);
    }
  }

  async function handleGeneratingAllPDFs() {
    if (!currentSheet || !tutorialId) {
      return;
    }

    try {
      setLoadingState(LoadingState.MULTIPLE);

      await generateAllPdfs({ tutorialId, sheet: currentSheet });
    } catch {
      enqueueSnackbar('PDFs konnten nicht erstellt werden.', { variant: 'error' });
    } finally {
      setLoadingState(LoadingState.NONE);
    }
  }

  return (
    <div className={classes.root}>
      <div className={classes.topBar}>
        <SheetSelector className={classes.sheetSelect} />

        <SubmitButton
          isSubmitting={loadingState !== LoadingState.NONE}
          variant='outlined'
          color='default'
          className={classes.createPdfsButton}
          onClick={handleGeneratingAllPDFs}
          disabled={!currentSheet}
          modalText={getGenerationModalText(loadingState)}
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
