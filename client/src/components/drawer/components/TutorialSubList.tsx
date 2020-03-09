import { Collapse, List, ListItem, ListItemText } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { ChevronUp as ExpandLessIcon, ChevronDown as ExpandMoreIcon } from 'mdi-material-ui';
import {
  AccountConvert as SubstituteTutorialIcon,
  CheckboxMarkedCircleOutline as TutorialToCorrectIcon,
} from 'mdi-material-ui';
import React, { useEffect, useState } from 'react';
import { RouteType } from '../../../routes/Routing.routes';
import DrawerListItem from './DrawerListItem';
import { getTutorialRelatedPath } from '../../../routes/Routing.helpers';
import { TutorialInEntity } from '../../../../../server/src/shared/model/Common';
import { Tutorial } from '../../../model/Tutorial';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    primary: {
      display: 'flex',
      alignItems: 'center',
    },
    icon: {
      marginLeft: theme.spacing(1),
    },
  })
);

interface TutorialSubListProps {
  tutorial: TutorialInEntity;
  tutorialRoutes: RouteType[];
  isDrawerOpen: boolean;
  isTutorialToCorrect?: boolean;
  isSubstituteTutorial?: boolean;
}

function TutorialSubList({
  tutorial,
  tutorialRoutes,
  isDrawerOpen,
  isTutorialToCorrect,
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
                {Tutorial.getDisplayString(tutorial)}{' '}
                {isSubstituteTutorial && (
                  <SubstituteTutorialIcon fontSize='small' className={classes.icon} />
                )}
                {isTutorialToCorrect && (
                  <TutorialToCorrectIcon fontSize='small' className={classes.icon} />
                )}
              </>
            ) : (
              `${tutorial.slot}`
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
