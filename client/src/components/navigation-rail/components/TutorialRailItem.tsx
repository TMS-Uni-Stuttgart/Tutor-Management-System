import React from 'react';
import { LoggedInUser } from '../../../model/LoggedInUser';
import { TutorialRelatedDrawerRoute } from '../../../routes/Routing.types';
import RailItem from './RailItem';
import { getSubItems } from './TutorialRailItem.helpers';

interface Props {
  route: TutorialRelatedDrawerRoute;
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
        key={route.template}
        path={subItems[0].subPath}
        text={route.title}
        icon={route.icon}
      />
    );
  }

  const tutorial =
    userData.tutorials[0] || userData.tutorialsToCorrect[0] || userData.substituteTutorials[0];
  return (
    <RailItem
      key={route.template}
      path={route.create({ tutorialId: tutorial.id })}
      text={route.title}
      icon={route.icon}
      subItems={getSubItems(route, userData)}
    />
  );
}

export default TutorialRailItem;
