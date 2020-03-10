import React from 'react';
import { LoggedInUser } from '../../../model/LoggedInUser';
import { RouteType } from '../../../routes/Routing.routes';
import { getSubItems } from '../NavigationRail.helper';
import RailItem from './RailItem';
import { getTutorialRelatedPath } from '../../../routes/Routing.helpers';

interface Props {
  route: RouteType;
  userData: LoggedInUser;
}

function TutorialRailItem({ route, userData }: Props): JSX.Element {
  if (
    userData.tutorials.length === 1 &&
    userData.tutorialsToCorrect.length === 0 &&
    userData.substituteTutorials.length === 0
  ) {
    const tutorial = userData.tutorials[0];
    return (
      <RailItem
        key={route.path}
        path={getTutorialRelatedPath(route, tutorial.id)}
        text={route.title}
        icon={route.icon}
      />
    );
  }

  return (
    <RailItem
      key={route.path}
      path={route.path}
      text={route.title}
      icon={route.icon}
      subItems={getSubItems(route, userData)}
    />
  );
}

export default TutorialRailItem;
