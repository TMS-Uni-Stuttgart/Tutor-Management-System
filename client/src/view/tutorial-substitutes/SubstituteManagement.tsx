import { Box, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import React, { useCallback, useState } from 'react';
import { Prompt, useParams } from 'react-router';
import { ISubstituteDTO } from 'shared/model/Tutorial';
import BackButton from '../../components/BackButton';
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
    scrollableBox: {
      overflowY: 'auto',
      ...theme.mixins.scrollbar(8),
    },
  })
);

interface Params {
  tutorialId: string;
}

function SubstituteManagementContent(): JSX.Element {
  const classes = useStyles();

  const { getSelectedSubstitute, dirty, tutorial } = useSubstituteManagementContext();
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
          datesOfSubstitute.push(date.toISODate());
          datesWithSubst.set(substitute.id, datesOfSubstitute);
        } else {
          datesWithoutSubst.push(date.toISODate());
        }
      });

      const substituteDTOs: ISubstituteDTO[] = [{ tutorId: undefined, dates: datesWithoutSubst }];

      datesWithSubst.forEach((dates, tutorId) => substituteDTOs.push({ tutorId, dates }));

      try {
        await setSubstituteTutor(tutorialId, substituteDTOs);
        await tutorial.execute(tutorial.value.id);

        setSubmitting(false);
        enqueueSnackbar('Vertretungen wurden erfolgreich gespeichert.', { variant: 'success' });
      } catch {
        enqueueSnackbar('Einige Vertretungen konnten nicht gespeichert werden.', {
          variant: 'error',
        });
      }
    },
    [getSelectedSubstitute, tutorial, enqueueSnackbar]
  );

  return (
    <Box
      flex={1}
      display='grid'
      gridTemplateColumns='fit-content(340px) minmax(0, 1fr)'
      gridTemplateRows='fit-content(80px) 1fr fit-content(80px)'
      gridRowGap={16}
      gridColumnGap={16}
      height='100%'
      component='form'
      onSubmit={handleSubmit}
    >
      <Box display='flex' alignItems='center'>
        <BackButton to={ROUTES.MANAGE_TUTORIALS.create({})} className={classes.backButton} />

        <Typography color='error' style={{ visibility: dirty ? 'visible' : 'hidden' }}>
          Es gibt ungespeicherte Änderungen.
        </Typography>

        <Prompt
          when={dirty}
          message='Es gibt ungespeicherte Änderungen. Soll die Seite wirklich verlassen werden?'
        />
      </Box>

      <DateBox />

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

      <Box gridArea='1 / 2 / span 3 / span 1' display='flex' flexDirection='column'>
        <SelectSubstitute />
      </Box>
    </Box>
  );
}

function SubstituteManagement(): JSX.Element {
  const { tutorialId } = useParams<Params>();

  return (
    <SubstituteManagementContextProvider tutorialId={tutorialId}>
      <SubstituteManagementContent />
    </SubstituteManagementContextProvider>
  );
}

export default SubstituteManagement;
