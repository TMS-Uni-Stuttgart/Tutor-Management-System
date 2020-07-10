import { Box, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useCallback, useState } from 'react';
import { Prompt, useParams } from 'react-router';
import BackButton from '../../components/BackButton';
import SubmitButton from '../../components/loading/SubmitButton';
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
  const { selectedSubstitutes, dirty } = useSubstituteManagementContext();
  const [isSubmitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLElement>) => {
      e.preventDefault();

      setSubmitting(true);
      console.log(selectedSubstitutes);
    },
    [selectedSubstitutes]
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
