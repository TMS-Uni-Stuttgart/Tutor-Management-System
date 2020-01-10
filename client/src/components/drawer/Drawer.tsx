import {
  Divider,
  Drawer as MuiDrawer,
  List,
  ListSubheader,
  Typography,
  Link,
} from '@material-ui/core';
import { DrawerProps } from '@material-ui/core/Drawer';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { OpenInNew as ExternalLinkIcon } from 'mdi-material-ui';
import clsx from 'clsx';
import React, { useMemo, useState, useEffect } from 'react';
import { useLogin } from '../../hooks/LoginService';
import { ROUTES, RouteType } from '../../routes/Routing.routes';
import DrawerListItem from './components/DrawerListItem';
import TutorialSubList from './components/TutorialSubList';
import { Role } from 'shared/dist/model/Role';
import { getVersionOfApp } from '../../hooks/fetching/Information';

const DRAWER_WIDTH_OPEN = 260;
const DRAWER_WIDTH_CLOSED = 56;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawer: {
      maxWidth: DRAWER_WIDTH_OPEN,
      flexShrink: 0,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
    },
    drawerOpen: {
      width: DRAWER_WIDTH_OPEN,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerClose: {
      width: DRAWER_WIDTH_CLOSED,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    drawerList: {
      paddingBottom: theme.spacing(4),
      overflowY: 'auto',
      overflowX: 'hidden',
      ...theme.mixins.scrollbar(4),
    },
    displayNone: {
      display: 'none',
    },
    toolbar: {
      ...theme.mixins.toolbar,
    },
    version: {
      position: 'absolute',
      bottom: theme.spacing(1),
      left: theme.spacing(1),
      right: theme.spacing(1),
      textAlign: 'center',
    },
  })
);

function isRoleMatching(userRoles: Role[], routeRoles: Role[] | 'all'): boolean {
  if (routeRoles === 'all') {
    return true;
  }

  return routeRoles.findIndex(role => userRoles.includes(role)) !== -1;
}

function filterRoutes(userRoles: Role[]) {
  const userRoutesWithoutTutorialRoutes: RouteType[] = [];
  const tutorialRoutes: RouteType[] = [];
  const substituteRoutes: RouteType[] = [];
  const managementRoutes: RouteType[] = [];

  for (const route of ROUTES) {
    if (!route.isInDrawer) {
      continue;
    }

    if (!isRoleMatching(userRoles, route.roles)) {
      continue;
    }

    if (
      Array.isArray(route.roles) &&
      (route.roles.indexOf(Role.ADMIN) !== -1 || route.roles.indexOf(Role.EMPLOYEE) !== -1)
    ) {
      managementRoutes.push(route);
    } else {
      if (!route.isTutorialRelated) {
        userRoutesWithoutTutorialRoutes.push(route);
      }

      if (route.isTutorialRelated) {
        tutorialRoutes.push(route);
      }

      if (route.isAccessibleBySubstitute) {
        if (!route.isTutorialRelated) {
          console.error(
            `[DRAWER] -- The route ${route.path} is accessible by substitutes but NOT tutorial related. It has to be both to be present in the Drawer.`
          );
        } else {
          substituteRoutes.push(route);
        }
      }
    }
  }

  return { userRoutesWithoutTutorialRoutes, tutorialRoutes, substituteRoutes, managementRoutes };
}

function Drawer({
  className,
  onClose,
  PaperProps,
  classes: PaperClasses,
  open,
  ...other
}: DrawerProps): JSX.Element {
  const classes = useStyles();
  const { userData } = useLogin();
  const [version, setVersion] = useState<string | undefined>(undefined);

  if (!userData) {
    throw new Error('Drawer without a user should be rendered. This is forbidden.');
  }

  const { tutorials, tutorialsToCorrect, substituteTutorials } = userData;
  const {
    userRoutesWithoutTutorialRoutes,
    tutorialRoutes,
    substituteRoutes,
    managementRoutes,
  } = useMemo(() => filterRoutes(userData.roles), [userData.roles]);

  useEffect(() => {
    getVersionOfApp()
      .then(version => setVersion(version))
      .catch(() => setVersion(undefined));
  }, []);

  return (
    <MuiDrawer
      PaperProps={{
        elevation: 2,
        ...PaperProps,
      }}
      {...other}
      variant='permanent'
      open={open}
      onClose={onClose}
      className={clsx(classes.drawer, className, {
        [classes.drawerOpen]: open,
        [classes.drawerClose]: !open,
      })}
      classes={{
        ...PaperClasses,
        paper: clsx(PaperClasses && PaperClasses.paper, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        }),
      }}
    >
      <div className={classes.toolbar} />

      <List className={classes.drawerList}>
        {userRoutesWithoutTutorialRoutes.map(route => (
          <DrawerListItem key={route.path} path={route.path} text={route.title} icon={route.icon} />
        ))}

        {tutorials.map(tutorial => (
          <React.Fragment key={tutorial.id}>
            <Divider />

            <TutorialSubList
              tutorial={tutorial}
              tutorialRoutes={tutorialRoutes}
              isDrawerOpen={!!open}
            />
          </React.Fragment>
        ))}

        {tutorialsToCorrect.map(tutorial => (
          <React.Fragment key={tutorial.id}>
            <Divider />

            <TutorialSubList
              tutorial={tutorial}
              tutorialRoutes={tutorialRoutes.filter(route =>
                isRoleMatching([Role.CORRECTOR], route.roles)
              )}
              isDrawerOpen={!!open}
              isTutorialToCorrect
            />
          </React.Fragment>
        ))}

        {substituteTutorials.map(tutorial => (
          <React.Fragment key={tutorial.id}>
            <Divider />

            <TutorialSubList
              tutorial={tutorial}
              tutorialRoutes={substituteRoutes}
              isDrawerOpen={!!open}
              isSubstituteTutorial={true}
            />
          </React.Fragment>
        ))}

        {managementRoutes.length > 0 && (
          <>
            <Divider />

            <ListSubheader className={clsx(!open && classes.displayNone)}>Verwaltung</ListSubheader>

            {managementRoutes.map(route => (
              <DrawerListItem
                key={route.path}
                path={route.path}
                text={route.title}
                icon={route.icon}
              />
            ))}
          </>
        )}
      </List>

      {version && (
        <Typography className={classes.version} variant='caption'>
          {open && <>Version: </>}

          <Link
            color='inherit'
            href={`https://github.com/Dudrie/Tutor-Management-System/releases/tag/v${version}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            {version}
            <ExternalLinkIcon fontSize='inherit' />
          </Link>
        </Typography>
      )}
    </MuiDrawer>
  );
}

export default Drawer;
