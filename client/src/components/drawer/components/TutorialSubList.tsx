import { Collapse, List, ListItem, ListItemText } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { ExpandLess as ExpandLessIcon, ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import { AccountConvert as SubstituteTutorialIcon } from 'mdi-material-ui';
import React, { useEffect, useState } from 'react';
import { LoggedInUserTutorial } from 'shared/dist/model/Tutorial';
import { getDisplayStringForTutorial } from '../../../util/helperFunctions';
import { getTutorialRelatedPath, RouteType } from '../../../util/RoutingPath';
import DrawerListItem from './DrawerListItem';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    primary: {
      display: 'flex',
      alignItems: 'center',
    },
    substituteIcon: {
      marginLeft: theme.spacing(1),
    },
  })
);

interface TutorialSubListProps {
  tutorial: LoggedInUserTutorial;
  tutorialRoutes: RouteType[];
  isDrawerOpen: boolean;
  isSubstituteTutorial?: boolean;
}

function TutorialSubList({
  tutorial,
  tutorialRoutes,
  isDrawerOpen,
  isSubstituteTutorial,
}: TutorialSubListProps) {
  const classes = useStyles();
  const [isOpen, setOpen] = useState(true);

  function handleClick() {
    if (isDrawerOpen) {
      setOpen(!isOpen);
    }
  }

  useEffect(() => {
    setOpen(true);
  }, [isDrawerOpen]);

  return (
    <>
      <ListItem button onClick={handleClick}>
        <ListItemText
          primary={
            isDrawerOpen ? (
              <>
                {getDisplayStringForTutorial(tutorial)}{' '}
                {isSubstituteTutorial && (
                  <SubstituteTutorialIcon fontSize='small' className={classes.substituteIcon} />
                )}
              </>
            ) : (
              `#${tutorial.slot}`
            )
          }
          classes={{
            primary: classes.primary,
          }}
        />
        {isDrawerOpen && (isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
      </ListItem>
      <Collapse in={isOpen} timeout='auto' unmountOnExit>
        <List component='div' disablePadding>
          {tutorialRoutes.map(route => {
            return (
              <DrawerListItem
                key={`${tutorial.id}-${route.path}`}
                path={getTutorialRelatedPath(route, tutorial.id)}
                text={route.title}
                icon={route.icon}
              />
            );
          })}
        </List>
      </Collapse>
    </>
  );
}

export default TutorialSubList;
