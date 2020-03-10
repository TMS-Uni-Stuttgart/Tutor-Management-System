import { CssBaseline, Theme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import { useLogin } from '../hooks/LoginService';
import { ROUTES, RouteType, RoutingPath } from '../routes/Routing.routes';
import AppBar from './AppBar';
import NavigationRail from './navigation-rail/NavigationRail';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    '@global': {
      body: {
        overflowY: 'hidden',
        maxWidth: '100vw',
        maxHeight: '100vh',
        '& *': {
          ...theme.mixins.scrollbar(8),
        },
      },
    },
    root: {
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
    },
    contentWrapper: {
      display: 'flex',
      flex: '1 1 auto',
      overflowY: 'auto',
      ...theme.mixins.scrollbar(12),
    },
    content: {
      width: 0,
      flexGrow: 1,
      height: '100%',
      '& > *': {
        height: 'inherit',
        padding: theme.spacing(2, 2, 1, 2),
        position: 'relative',
      },
    },
  })
);

function getRouteElementForRoute(route: RouteType): JSX.Element {
  const path: string = (route.isTutorialRelated
    ? `/tutorial/:tutorialId/${route.path}`
    : route.path
  ).replace(/\/\/+/, '/');

  if (route.isPrivate) {
    return (
      <PrivateRoute key={path} path={path} component={route.component} exact={route.isExact} />
    );
  } else {
    return <Route key={path} path={path} component={route.component} exact={route.isExact} />;
  }
}

function App() {
  const classes = useStyles();
  const { isLoggedIn } = useLogin();
  const [isDrawerOpen, setDrawerOpen] = useState(true);
  const { ROOT, LOGIN } = RoutingPath;

  const routes = ROUTES.map(route => getRouteElementForRoute(route));

  return (
    <>
      <CssBaseline />

      <div className={classes.root}>
        <AppBar onMenuButtonClicked={() => setDrawerOpen(!isDrawerOpen)} />

        <div className={classes.contentWrapper}>
          {isLoggedIn() && (
            <NavigationRail open={isDrawerOpen} onClose={() => setDrawerOpen(false)} />
          )}

          <div className={classes.content}>
            <Switch>
              {routes}

              <Route exact path={ROOT} render={() => <Redirect to={LOGIN} />} />
            </Switch>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
