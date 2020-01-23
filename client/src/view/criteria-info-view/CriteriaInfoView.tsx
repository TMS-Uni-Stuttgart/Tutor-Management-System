import { Box, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { getNameOfEntity } from 'shared/dist/util/helpers';
import BackButton from '../../components/BackButton';
import Placeholder from '../../components/Placeholder';
import { RoutingPath } from '../../routes/Routing.routes';
import ScheinStatusBox from '../studentmanagement/student-info/components/ScheinStatusBox';

const useStyles = makeStyles(theme =>
  createStyles({
    backButton: {
      marginRight: theme.spacing(2),
      alignSelf: 'center',
    },
  })
);

function CriteriaInfoView(): JSX.Element {
  const classes = useStyles();

  return (
    <Box display='flex' flexDirection='column'>
      <Box display='flex' marginBottom={3}>
        <BackButton to={RoutingPath.MANAGE_SCHEIN_CRITERIAS} className={classes.backButton} />

        {/* <Typography variant='h4'>{student && getNameOfEntity(student)}</Typography>

        <ScheinStatusBox scheinStatus={scheinStatus} marginLeft='auto' /> */}
      </Box>

      <Placeholder
        placeholderText='Kein Studierender verfügbar.'
        showPlaceholder={false}
        loading={true}
      >
        <Box display='flex' flexDirection='column' marginBottom={1}></Box>
      </Placeholder>
    </Box>
  );
}

export default CriteriaInfoView;
