import { Box, Divider, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useMemo, useState } from 'react';
import { MemoryRouter, useHistory } from 'react-router-dom';
import BackButton from '../../components/BackButton';
import CustomSelect, { OnChangeHandler } from '../../components/CustomSelect';
import Placeholder from '../../components/Placeholder';
import { useTutorialFromPath } from '../../hooks/useTutorialFromPath';
import { ROUTES } from '../../routes/Routing.routes';
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
  })
);

interface Props {
  routes: TutorialRelatedDrawerRoute[];
}

function getAllRelatedRoutes(): TutorialRelatedDrawerRoute[] {
  const routes: TutorialRelatedDrawerRoute[] = [];

  for (const route of Object.values(ROUTES)) {
    if (route.isTutorialRelatedDrawerRoute()) {
      routes.push(route);
    }
  }

  return routes;
}

function Content({ routes }: Props): JSX.Element {
  const classes = useStyles();

  const history = useHistory();
  const { tutorial, isLoading, error } = useTutorialFromPath();

  const [value, setValue] = useState('');

  const items = useMemo(() => routes.filter((r) => r.isInDrawer), [routes]);

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
        <BackButton to={ROUTES.MANAGE_TUTORIALS.create({})} />

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

      <Box flex={1} marginTop={3}>
        <Placeholder
          placeholderText={error ?? 'Kein Tutorium gefunden.'}
          showPlaceholder={!!error || !tutorial}
          loading={isLoading}
        >
          <Routes routes={routes} />
        </Placeholder>
      </Box>
    </Box>
  );
}

function TutorialInternalsManagement(): JSX.Element {
  const routes: TutorialRelatedDrawerRoute[] = useMemo(() => getAllRelatedRoutes(), []);

  return (
    <MemoryRouter>
      <Content routes={routes} />
    </MemoryRouter>
  );
}

export default TutorialInternalsManagement;
