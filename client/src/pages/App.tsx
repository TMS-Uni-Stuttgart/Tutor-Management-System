import { CssBaseline, Theme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useMemo, useState } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import NavigationRail from '../components/navigation-rail/NavigationRail';
import PrivateRoute from '../components/PrivateRoute';
import { useLogin } from '../hooks/LoginService';
import { ROOT_REDIRECT_PATH, ROUTES } from '../routes/Routing.routes';
import { CustomRoute } from '../routes/Routing.types';
import { PathPart } from '../routes/typesafe-react-router';
import AppBar from './AppBar';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    '@global': {
      body: {
        overflowY: 'hidden',
        maxWidth: '100vw',
        maxHeight: '100vh',
        '& *': {
          ...theme.mixins.scrollbar(12),
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
      // Do NOT set the height on this class. If will break in Safari.
      display: 'flex',
      width: 0,
      flexGrow: 1,
      '& > *': {
        width: '100%',
        height: 'inherit',
        padding: theme.spacing(2, 2, 1, 2),
        position: 'relative',
      },
    },
  })
);

function getRouteElementForRoute(route: CustomRoute<PathPart<any, any>[]>): JSX.Element {
  const path = route.template;

  if (route.isPrivate) {
    return (
      <PrivateRoute key={path} path={path} component={route.component} exact={route.isExact} />
    );
  } else {
    return <Route key={path} path={path} component={route.component} exact={route.isExact} />;
  }
}

function App(): JSX.Element {
  const classes = useStyles();
  const { isLoggedIn } = useLogin();
  const [isDrawerOpen, setDrawerOpen] = useState(true);

  const routes = useMemo(
    () => Object.values(ROUTES).map((route) => getRouteElementForRoute(route)),
    []
  );

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

              <Route
                exact
                path={'/'}
                render={() => <Redirect to={ROOT_REDIRECT_PATH.create({})} />}
              />
            </Switch>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
