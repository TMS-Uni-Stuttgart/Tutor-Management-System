import { useMemo } from 'react';
import { Route, Routes } from 'react-router';
import { TutorialRelatedDrawerRoute } from '../../../routes/Routing.types';

interface TutorialRoutesProps {
  routes: TutorialRelatedDrawerRoute[];
}

function TutorialRoutes({ routes }: TutorialRoutesProps): JSX.Element {
  const routesToRender = useMemo(
    () =>
      routes.map((route) => (
        <Route key={route.template} path={route.template} element={<route.component />} />
      )),
    [routes]
  );

  return <Routes>{routesToRender}</Routes>;
}

export default TutorialRoutes;
