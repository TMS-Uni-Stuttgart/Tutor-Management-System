import { Box, Button, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import BackButton from '../../components/BackButton';
import OutlinedBox from '../../components/OutlinedBox';
import { ROUTES } from '../../routes/Routing.routes';

const useStyles = makeStyles((theme) =>
  createStyles({
    scrollableBox: {
      overflowY: 'auto',
      ...theme.mixins.scrollbar(4),
    },
    backButton: {
      height: 'fit-content',
      marginRight: theme.spacing(1),
    },
  })
);

function TutorialSubstituteManagement(): JSX.Element {
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
      <Box display='flex' alignItems='flex-start'>
        <BackButton to={ROUTES.MANAGE_TUTORIALS.create({})} className={classes.backButton} />

        <Typography color='error' style={{ visibility: 'visible' }}>
          Es gibt ungespeicherte Änderungen.
        </Typography>
      </Box>

      <Box className={classes.scrollableBox}>
        <div style={{ height: 2000 }}></div>
        <span>Hello</span>
      </Box>

      <Button variant='contained' color='primary' fullWidth>
        Vertretungen speichern
      </Button>

      <OutlinedBox gridArea='1 / 2 / span 3 / span 1'>
        {/* <div style={{ height: 2000 }}></div> */}
        <span>On the right</span>
      </OutlinedBox>
    </Box>
  );
}

export default TutorialSubstituteManagement;
