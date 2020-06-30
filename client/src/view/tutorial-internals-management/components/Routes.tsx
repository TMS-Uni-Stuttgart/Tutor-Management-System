import React, { useMemo } from 'react';
import { Route, Switch } from 'react-router';
import { RouteType } from '../../../routes/Routing.routes';

interface RoutesProps {
  routes: RouteType[];
  basePath: string;
}

export function getRouteOfSubPath(basePath: string, subRoute: string): string {
  return `${basePath}/${subRoute}`.replace(/\/\//g, '/');
}

function Routes({ routes, basePath }: RoutesProps): JSX.Element {
  const routesToRender = useMemo(
    () =>
      routes.map((route) => (
        <Route
          key={route.path}
          path={getRouteOfSubPath(basePath, route.path)}
          component={route.component}
        />
      )),
    [routes, basePath]
  );

  return <Switch>{routesToRender}</Switch>;
}

export default Routes;
