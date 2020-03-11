import React from 'react';
import { LoggedInUser } from '../../../model/LoggedInUser';
import { RouteType } from '../../../routes/Routing.routes';
import { getSubItems } from '../NavigationRail.helper';
import RailItem from './RailItem';
import { getTutorialRelatedPath } from '../../../routes/Routing.helpers';
import { Role } from '../../../../../server/src/shared/model/Role';

interface Props {
  route: RouteType;
  userData: LoggedInUser;
}

function TutorialRailItem({ route, userData }: Props): JSX.Element {
  const tutorial = userData.tutorials[0];
  const component = (
    <RailItem
      key={route.path}
      path={getTutorialRelatedPath(route, tutorial.id)}
      text={route.title}
      icon={route.icon}
      subItems={getSubItems(route, userData)}
    />
  );

  if (userData.tutorials.length > 1) {
    return component;
  }

  if (route.roles.includes(Role.CORRECTOR) && userData.tutorialsToCorrect.length > 0) {
    return component;
  }

  if (route.isAccessibleBySubstitute && userData.substituteTutorials.length > 0) {
    return component;
  }

  return (
    <RailItem
      key={route.path}
      path={getTutorialRelatedPath(route, tutorial.id)}
      text={route.title}
      icon={route.icon}
    />
  );
}

export default TutorialRailItem;
