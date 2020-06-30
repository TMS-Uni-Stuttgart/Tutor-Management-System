import { Box, Divider, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useMemo, useState } from 'react';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import BackButton from '../../components/BackButton';
import CustomSelect, { OnChangeHandler } from '../../components/CustomSelect';
import { TUTORIAL_ROUTES } from '../../routes/Routes.tutorial';
import { RouteType, RoutingPath } from '../../routes/Routing.routes';
import { getManageTutorialInternalsPath } from '../../routes/Routing.helpers';

const useStyles = makeStyles((theme) =>
  createStyles({
    header: {
      marginLeft: theme.spacing(2),
      flex: 1,
    },
    dropdown: {
      flex: 1,
    },
  })
);

interface Props {
  routes: RouteType[];
  basePath: string;
}

interface Item {
  path: string;
  title: string;
  component: JSX.Element;
}

function getRouteOfSubPath(basePath: string, subRoute: string): string {
  return `${basePath}/${subRoute}`.replace(/\/\//g, '/');
}

function Routes({ routes, basePath }: Props): JSX.Element {
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

function useInnerRouteMatch(routes: RouteType[], basePath: string) {
  const routeStrings = useMemo(() => routes.map((r) => getRouteOfSubPath(basePath, r.path)), [
    routes,
    basePath,
  ]);
  const match = useRouteMatch(routeStrings);
  return match;
}

function Content({ routes, basePath }: Props): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const [value, setValue] = useState('');

  const match = useInnerRouteMatch(routes, basePath);

  useEffect(() => {
    if (!!match) {
      const [, subPath] = match.path.split(basePath);
      setValue(subPath);
    } else {
      setValue('');
    }
  }, [basePath, match]);

  const onPathSelect: OnChangeHandler = (e) => {
    if (typeof e.target.value !== 'string') {
      return;
    }

    history.push({ pathname: getRouteOfSubPath(basePath, e.target.value) });
  };

  return (
    <Box display='flex' flexDirection='column'>
      <Box marginBottom={2} display='flex' alignItems='center'>
        <BackButton to={RoutingPath.MANAGE_TUTORIALS} />

        <Typography className={classes.header}>Verwalte [[TUTORIAL_SLOT_NAME]]</Typography>

        <CustomSelect
          label='Bereich auswählen'
          items={routes}
          value={value}
          itemToString={(item) => item.title}
          itemToValue={(item) => item.path}
          onChange={onPathSelect}
          className={classes.dropdown}
        />
      </Box>

      <Divider />

      <Box flex={1} marginTop={2} style={{ overflowY: 'auto' }}>
        <Routes routes={routes} basePath={basePath} />
      </Box>
    </Box>
  );
}

function TutorialInternalsManagement(): JSX.Element {
  const tutorialId = 'TUT_ID'; // TODO:
  const routes = useMemo(() => TUTORIAL_ROUTES.filter((r) => r.isInDrawer), []);
  const basePath = useMemo(() => getManageTutorialInternalsPath(tutorialId), [tutorialId]);

  return <Content basePath={basePath} routes={routes} />;
}

export default TutorialInternalsManagement;
