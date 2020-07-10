import { Box, Button, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import BackButton from '../../components/BackButton';
import OutlinedBox from '../../components/OutlinedBox';
import { ROUTES } from '../../routes/Routing.routes';
import DateBox from './components/DateBox';
import SelectSubstitute from './components/SelectSubstitute';
import SubstituteManagementContextProvider from './SubstituteManagement.context';

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

function SubstituteManagementContent(): JSX.Element {
  const classes = useStyles();

  return (
    <Box
      flex={1}
      display='grid'
      gridTemplateColumns='fit-content(340px) minmax(0, 1fr)'
      gridTemplateRows='fit-content(80px) 1fr fit-content(80px)'
      gridRowGap={16}
      gridColumnGap={16}
      height='100%'
    >
      <Box display='flex' alignItems='center'>
        <BackButton to={ROUTES.MANAGE_TUTORIALS.create({})} className={classes.backButton} />

        <Typography color='error' style={{ visibility: 'visible' }}>
          Es gibt ungespeicherte Änderungen.
        </Typography>
      </Box>

      <DateBox />

      <Button variant='contained' color='primary' fullWidth>
        Vertretungen speichern
      </Button>

      <OutlinedBox gridArea='1 / 2 / span 3 / span 1' display='flex' flexDirection='column'>
        <SelectSubstitute />
      </OutlinedBox>
    </Box>
  );
}

function SubstituteManagement(): JSX.Element {
  // FIXME: Use correct tutorial ID.
  return (
    <SubstituteManagementContextProvider tutorialId={'DERPY_ID'}>
      <SubstituteManagementContent />
    </SubstituteManagementContextProvider>
  );
}

export default SubstituteManagement;
