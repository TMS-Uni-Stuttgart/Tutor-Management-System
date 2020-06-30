import React, { useMemo } from 'react';
import { Route, Switch } from 'react-router';
import { RouteType } from '../../../routes/Routing.routes';

interface RoutesProps {
  routes: RouteType[];
  basePath: string;
}

interface RouteOfSubPathParams {
  basePath: string;
  subRoute: string;
  tutorialId?: string;
}

export function getRouteOfSubPath({
  basePath,
  subRoute,
  tutorialId,
}: RouteOfSubPathParams): string {
  const path = `${basePath}/${subRoute}`.replace(/\/\//g, '/');

  return !!tutorialId ? path.replace(':tutorialId', tutorialId) : path;
}

function Routes({ routes, basePath }: RoutesProps): JSX.Element {
  const routesToRender = useMemo(
    () =>
      routes.map((route) => (
        <Route
          key={route.path}
          path={getRouteOfSubPath({ basePath, subRoute: route.path })}
          component={route.component}
        />
      )),
    [routes, basePath]
  );

  return <Switch>{routesToRender}</Switch>;
}

export default Routes;
