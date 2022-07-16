import React, { useMemo } from 'react';
import { Route, Switch } from 'react-router';
import { TutorialRelatedDrawerRoute } from '../../../routes/Routing.types';

interface RoutesProps {
  routes: TutorialRelatedDrawerRoute[];
}

function Routes({ routes }: RoutesProps): JSX.Element {
  const routesToRender = useMemo(
    () =>
      routes.map((route) => (
        <Route
          key={route.template}
          path={route.template}
          component={route.component}
          exact={route.isExact}
        />
      )),
    [routes]
  );

  return <Switch>{routesToRender}</Switch>;
}

export default Routes;
