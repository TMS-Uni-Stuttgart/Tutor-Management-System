import { Box, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import React, { useCallback, useState } from 'react';
import { Prompt, useParams, useRouteMatch } from 'react-router';
import { ISubstituteDTO } from 'shared/model/Tutorial';
import BackButton from '../../components/back-button/BackButton';
import DisableBackButton from '../../components/back-button/DisableBackButton.context';
import SubmitButton from '../../components/loading/SubmitButton';
import { setSubstituteTutor } from '../../hooks/fetching/Tutorial';
import { ROUTES } from '../../routes/Routing.routes';
import DateBox from './components/DateBox';
import SelectSubstitute from './components/SelectSubstitute';
import SubstituteManagementContextProvider, {
  useSubstituteManagementContext,
} from './SubstituteManagement.context';

const useStyles = makeStyles((theme) =>
  createStyles({
    backButton: {
      height: 'fit-content',
      marginRight: theme.spacing(1),
    },
  })
);

interface Params {
  tutorialId: string;
}

function SubstituteManagementContent(): JSX.Element {
  const classes = useStyles();

  const { getSelectedSubstitute, dirty, tutorial, resetDirty } = useSubstituteManagementContext();
  const { enqueueSnackbar } = useSnackbar();

  const [isSubmitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLElement>) => {
      e.preventDefault();

      if (!tutorial.value) {
        return;
      }

      setSubmitting(true);
      const tutorialId = tutorial.value.id;
      const datesWithSubst: Map<string, string[]> = new Map();
      const datesWithoutSubst: string[] = [];

      tutorial.value.dates.forEach((date) => {
        const substitute = getSelectedSubstitute(date);

        if (!!substitute) {
          const datesOfSubstitute = datesWithSubst.get(substitute.id) ?? [];
          datesOfSubstitute.push(date.toISODate() ?? '');
          datesWithSubst.set(substitute.id, datesOfSubstitute.filter(Boolean));
        } else {
          datesWithoutSubst.push(date.toISODate() ?? '');
        }
      });

      const substituteDTOs: ISubstituteDTO[] = [
        { tutorId: undefined, dates: datesWithoutSubst.filter(Boolean) },
      ];

      datesWithSubst.forEach((dates, tutorId) => substituteDTOs.push({ tutorId, dates }));

      try {
        await setSubstituteTutor(tutorialId, substituteDTOs);
        await tutorial.execute(tutorial.value.id);

        resetDirty();
        enqueueSnackbar('Vertretungen wurden erfolgreich gespeichert.', {
          variant: 'success',
        });
      } catch {
        enqueueSnackbar('Einige Vertretungen konnten nicht gespeichert werden.', {
          variant: 'error',
        });
      } finally {
        setSubmitting(false);
      }
    },
    [getSelectedSubstitute, tutorial, enqueueSnackbar, resetDirty]
  );

  return (
    <Box
      flex={1}
      display='grid'
      gridTemplateColumns='minmax(300px, 340px) minmax(0, 1fr)'
      gridTemplateRows='fit-content(80px) 1fr fit-content(80px)'
      gridRowGap={16}
      gridColumnGap={16}
      height='100%'
      component='form'
      onSubmit={handleSubmit}
    >
      <Box display='flex' alignItems='center'>
        <BackButton to={ROUTES.MANAGE_TUTORIALS.create({})} className={classes.backButton} />

        <Prompt
          when={dirty}
          message='Es gibt ungespeicherte Änderungen. Soll die Seite wirklich verlassen werden?'
        />
      </Box>

      <DateBox />

      <Box display='grid' gridRowGap={8}>
        <Typography color='error' style={{ display: dirty ? undefined : 'none' }}>
          Es gibt ungespeicherte Änderungen.
        </Typography>

        <SubmitButton
          isSubmitting={isSubmitting}
          modalText={'Aktualisiere Vertretungen...'}
          disabled={!dirty}
          type='submit'
          variant='contained'
          color='primary'
          fullWidth
          CircularProgressProps={{ color: 'primary' }}
        >
          Vertretungen speichern
        </SubmitButton>
      </Box>

      <Box gridArea='1 / 2 / span 3 / span 1' display='flex' flexDirection='column'>
        <SelectSubstitute />
      </Box>
    </Box>
  );
}

function SubstituteManagement(): JSX.Element {
  const { tutorialId } = useParams<Params>();
  const { path } = useRouteMatch();
  const isAdminVersion = ROUTES.MANAGE_TUTORIAL_SUBSTITUTES.template === path;

  return (
    <DisableBackButton isBackDisabled={!isAdminVersion}>
      <SubstituteManagementContextProvider tutorialId={tutorialId}>
        <SubstituteManagementContent />
      </SubstituteManagementContextProvider>
    </DisableBackButton>
  );
}

export default SubstituteManagement;
