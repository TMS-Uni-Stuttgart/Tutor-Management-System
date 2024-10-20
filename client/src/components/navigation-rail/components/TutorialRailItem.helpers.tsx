import {
  AccountConvert as SubstituteTutorialIcon,
  CheckboxMarkedCircleOutline as TutorialToCorrectIcon,
  HumanMaleBoard as TutorialIcon,
} from 'mdi-material-ui';
import { Role } from 'shared/model/Role';
import { LoggedInUser } from '../../../model/LoggedInUser';
import { Tutorial } from '../../../model/Tutorial';
import { RailSubItemProps } from './RailSubItem';
import { FilteredRoutes } from '../NavigationRail.helper';

export function getSubItems(
  route: FilteredRoutes['tutorialRoutes'][number],
  userData: LoggedInUser
): RailSubItemProps[] {
  const subItems: RailSubItemProps[] = [];

  userData.tutorials.forEach((tutorial) => {
    subItems.push({
      subPath: route.route.buildPath({ tutorialId: tutorial.id }),
      subPathTemplate: route.route.path,
      icon: TutorialIcon,
      text: Tutorial.getDisplayString(tutorial),
    });
  });

  if (route.handle.roles.includes(Role.CORRECTOR)) {
    userData.tutorialsToCorrect.forEach((tutorial) => {
      subItems.push({
        subPath: route.route.buildPath({ tutorialId: tutorial.id }),
        subPathTemplate: route.route.path,
        icon: TutorialToCorrectIcon,
        text: Tutorial.getDisplayString(tutorial),
      });
    });
  }

  if (route.handle.isAccessibleBySubstitute) {
    userData.substituteTutorials.forEach((tutorial) => {
      subItems.push({
        subPath: route.route.buildPath({ tutorialId: tutorial.id }),
        subPathTemplate: route.route.path,
        icon: SubstituteTutorialIcon,
        text: Tutorial.getDisplayString(tutorial),
      });
    });
  }

  return subItems;
}
