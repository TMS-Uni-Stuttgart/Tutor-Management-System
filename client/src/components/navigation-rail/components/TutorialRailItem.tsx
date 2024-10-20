import React from 'react';
import { LoggedInUser } from '../../../model/LoggedInUser';
import RailItem from './RailItem';
import { getSubItems } from './TutorialRailItem.helpers';
import { FilteredRoutes } from '../NavigationRail.helper';

interface Props {
  route: FilteredRoutes['tutorialRoutes'][number];
  userData: LoggedInUser;
}

function TutorialRailItem({ route, userData }: Props): JSX.Element | null {
  const subItems = getSubItems(route, userData);

  if (subItems.length === 0) {
    return null;
  }

  if (subItems.length === 1) {
    return (
      <RailItem
        key={route.route.path}
        path={subItems[0].subPath}
        pathTemplate={subItems[0].subPathTemplate}
        text={route.handle.title}
        icon={route.handle.icon}
      />
    );
  }

  const tutorial =
    userData.tutorials[0] || userData.tutorialsToCorrect[0] || userData.substituteTutorials[0];
  return (
    <RailItem
      key={route.route.path}
      path={route.route.buildPath({ tutorialId: tutorial.id })}
      pathTemplate={route.route.path}
      text={route.handle.title}
      icon={route.handle.icon}
      subItems={getSubItems(route, userData)}
    />
  );
}

export default TutorialRailItem;
