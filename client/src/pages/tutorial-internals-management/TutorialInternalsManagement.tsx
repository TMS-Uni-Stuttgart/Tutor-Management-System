import { Box, Button, Divider, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { ChevronLeft as BackIcon } from 'mdi-material-ui';
import React, { useCallback, useMemo, useState } from 'react';
import { MemoryRouter, useHistory, useLocation } from 'react-router-dom';
import CustomSelect, { OnChangeHandler } from '../../components/CustomSelect';
import Placeholder from '../../components/Placeholder';
import { useTutorialFromPath } from '../../hooks/useTutorialFromPath';
import { Tutorial } from '../../model/Tutorial';
import { ROUTES, TUTORIAL_ROUTES } from '../../routes/Routing.routes';
import { TutorialRelatedDrawerRoute } from '../../routes/Routing.types';
import Routes from './components/Routes';

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
  routes: TutorialRelatedDrawerRoute[];
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

function getAllRelatedRoutes(): TutorialRelatedDrawerRoute[] {
  return [...Object.values(TUTORIAL_ROUTES)] as any;
}

function getPlaceholderData({
  error,
  tutorial,
  pathname,
}: PlaceholderDataParams): { placeholderText: string; showPlaceholder: boolean } {
  const isRootPath = pathname === '/';
  let placeholderText = '';

  if (!!error) {
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

function Content({ routes, tutorial, isLoading, error, onBackClick }: Props): JSX.Element {
  const classes = useStyles();

  const history = useHistory();
  const { pathname } = useLocation();
  const [value, setValue] = useState('');

  const items = useMemo(() => routes.filter((r) => r.isInDrawer && r.isTutorialRelated), [routes]);
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
    const subRoute = routes.find((r) => r.template === subRoutePath);

    if (!subRoute) {
      setValue('');
    } else {
      setValue(subRoutePath);
      history.push(subRoute.create({ tutorialId: tutorial.id }));
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
          itemToString={(item) => item.title}
          itemToValue={(item) => item.template}
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
          <Routes routes={routes} />
        </Placeholder>
      </Box>
    </Box>
  );
}

function TutorialInternalsManagement(): JSX.Element {
  const history = useHistory();
  const { tutorial, isLoading, error } = useTutorialFromPath();

  const routes: TutorialRelatedDrawerRoute[] = useMemo(() => getAllRelatedRoutes(), []);
  const handleBackClick = useCallback(() => {
    history.push({ pathname: ROUTES.MANAGE_TUTORIALS.create({}) });
  }, [history]);

  return (
    <MemoryRouter>
      <Content
        routes={routes}
        onBackClick={handleBackClick}
        tutorial={tutorial}
        isLoading={isLoading}
        error={error}
      />
    </MemoryRouter>
  );
}

export default TutorialInternalsManagement;
