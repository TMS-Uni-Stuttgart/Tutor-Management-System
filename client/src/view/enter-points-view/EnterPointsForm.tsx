import { Typography } from '@material-ui/core';
import React from 'react';
import { useParams } from 'react-router';
import BackButton from '../../components/BackButton';
import { getPathOfRouteWithTutorial } from '../../util/routing/Routing.helpers';
import { RoutingPath } from '../../util/routing/Routing.routes';

interface RouteParams {
  tutorialId?: string;
  sheetId?: string;
  teamId?: string;
}

function EnterPointsForm(): JSX.Element {
  const { tutorialId, sheetId, teamId } = useParams<RouteParams>();

  if (!tutorialId || !sheetId || !teamId) {
    return (
      <Typography color='error'>
        At least one of the three required params <code>tutorialId, sheetId, teamId</code> was not
        provided through path params.
      </Typography>
    );
  }

  return (
    <BackButton to={getPathOfRouteWithTutorial(RoutingPath.ENTER_POINTS_OVERVIEW, tutorialId)} />
  );
}

export default EnterPointsForm;
