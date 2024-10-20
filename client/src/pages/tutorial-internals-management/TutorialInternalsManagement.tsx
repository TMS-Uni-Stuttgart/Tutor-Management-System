import { Box, Button, Divider, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { ChevronLeft as BackIcon } from 'mdi-material-ui';
import { useCallback, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import CustomSelect, { OnChangeHandler } from '../../components/CustomSelect';
import Placeholder from '../../components/Placeholder';
import { useTutorialFromPath } from '../../hooks/useTutorialFromPath';
import { Tutorial } from '../../model/Tutorial';
import { ROUTES, TUTORIAL_ROUTE_HANDLES } from '../../routes/Routing.routes';

const useStyles = makeStyles((theme) =>
  createStyles({
    header: {
      marginLeft: theme.spacing(2),
      flex: 1,
    },
    dropdown: {
      flex: 1,
    },
    backIcon: {
      marginLeft: theme.spacing(-0.5),
      marginRight: theme.spacing(0.5),
    },
    backButton: {
      width: 'max-content',
    },
  })
);

interface Props {
  tutorial: Tutorial | undefined;
  isLoading: boolean;
  error?: string;
  onBackClick: () => void;
}

interface PlaceholderDataParams {
  error?: string;
  tutorial?: Tutorial;
  pathname: string;
}

const tutorialRoutes = [
  {
    route: ROUTES.MANAGE_TUTORIAL_INTERNALS.ATTENDANCE,
    handle: TUTORIAL_ROUTE_HANDLES.ATTENDANCE,
  } as const,
  {
    route: ROUTES.MANAGE_TUTORIAL_INTERNALS.ENTER_POINTS_OVERVIEW,
    handle: TUTORIAL_ROUTE_HANDLES.ENTER_POINTS_OVERVIEW,
  } as const,
  {
    route: ROUTES.MANAGE_TUTORIAL_INTERNALS.PRESENTATION_POINTS,
    handle: TUTORIAL_ROUTE_HANDLES.PRESENTATION_POINTS,
  } as const,
  {
    route: ROUTES.MANAGE_TUTORIAL_INTERNALS.SCHEIN_EXAMS_OVERVIEW,
    handle: TUTORIAL_ROUTE_HANDLES.SCHEIN_EXAMS_OVERVIEW,
  } as const,
  {
    route: ROUTES.MANAGE_TUTORIAL_INTERNALS.STUDENT_OVERVIEW,
    handle: TUTORIAL_ROUTE_HANDLES.STUDENT_OVERVIEW,
  } as const,
  {
    route: ROUTES.MANAGE_TUTORIAL_INTERNALS.TEAM_OVERVIEW,
    handle: TUTORIAL_ROUTE_HANDLES.TEAM_OVERVIEW,
  } as const,
  {
    route: ROUTES.MANAGE_TUTORIAL_INTERNALS.TUTORIAL_SUBSTITUTES,
    handle: TUTORIAL_ROUTE_HANDLES.TUTORIAL_SUBSTITUTES,
  } as const,
];

function getPlaceholderData({ error, tutorial, pathname }: PlaceholderDataParams): {
  placeholderText: string;
  showPlaceholder: boolean;
} {
  const isRootPath = pathname === '/';
  let placeholderText = '';

  if (error) {
    placeholderText = error;
  } else if (!tutorial) {
    placeholderText = 'Kein Tutorium gefunden.';
  } else if (isRootPath) {
    placeholderText = 'Kein Bereich ausgewählt.';
  }

  return {
    placeholderText,
    showPlaceholder: !!error || !tutorial || isRootPath,
  };
}

function Content({ tutorial, isLoading, error, onBackClick }: Props): JSX.Element {
  const classes = useStyles();
  const routes = tutorialRoutes;

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [value, setValue] = useState('');

  const items = routes;
  const { placeholderText, showPlaceholder } = useMemo(
    () => getPlaceholderData({ error, tutorial, pathname }),
    [error, tutorial, pathname]
  );

  const onPathSelect: OnChangeHandler = (e) => {
    if (typeof e.target.value !== 'string') {
      return;
    }

    if (!tutorial) {
      return;
    }

    const subRoutePath = e.target.value;
    const subRoute = routes.find((r) => r.route.path === subRoutePath);

    if (!subRoute) {
      setValue('');
    } else {
      setValue(subRoutePath);
      navigate(subRoute.route.buildPath({ tutorialId: tutorial.id }));
    }
  };

  return (
    <Box display='flex' flexDirection='column'>
      <Box marginBottom={2} display='flex' alignItems='center'>
        <Button variant='outlined' className={classes.backButton} onClick={onBackClick}>
          <BackIcon className={classes.backIcon} />
          Zurück zur Übersicht
        </Button>

        <Typography className={classes.header} variant='h5'>
          {!!tutorial ? `Verwalte ${tutorial.toDisplayString()}` : 'Kein Tutorium.'}
        </Typography>

        <CustomSelect
          label='Bereich auswählen'
          disabled={!tutorial}
          items={items}
          value={value}
          itemToString={(item) => item.handle.title}
          itemToValue={(item) => item.route.path}
          onChange={onPathSelect}
          className={classes.dropdown}
        />
      </Box>

      <Divider />

      <Box
        flex={1}
        marginTop={3}
        display='flex'
        flexDirection='column'
        style={{ overflowY: 'auto' }}
      >
        <Placeholder
          placeholderText={placeholderText}
          showPlaceholder={showPlaceholder}
          loading={isLoading}
        >
          <Outlet />
        </Placeholder>
      </Box>
    </Box>
  );
}


function TutorialInternalsManagement(): JSX.Element {
  const navigate = useNavigate();
  const { tutorial, isLoading, error } = useTutorialFromPath();

  const handleBackClick = useCallback(() => {
    navigate({ pathname: ROUTES.MANAGE_TUTORIALS.buildPath({}) });
  }, [navigate]);

  return (
    <Content
      onBackClick={handleBackClick}
      tutorial={tutorial}
      isLoading={isLoading}
      error={error}
    />
  );
}

export default TutorialInternalsManagement;
