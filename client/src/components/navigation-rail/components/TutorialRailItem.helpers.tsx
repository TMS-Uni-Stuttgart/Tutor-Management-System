import {
  AccountConvert as SubstituteTutorialIcon,
  CheckboxMarkedCircleOutline as TutorialToCorrectIcon,
  HumanMaleBoard as TutorialIcon,
} from 'mdi-material-ui';
import { Role } from 'shared/model/Role';
import { LoggedInUser } from '../../../model/LoggedInUser';
import { Tutorial } from '../../../model/Tutorial';
import { TutorialRelatedDrawerRoute } from '../../../routes/Routing.types';
import { RailSubItemProps } from './RailSubItem';

export function getSubItems(
  route: TutorialRelatedDrawerRoute,
  userData: LoggedInUser
): RailSubItemProps[] {
  const subItems: RailSubItemProps[] = [];

  userData.tutorials.forEach((tutorial) => {
    subItems.push({
      subPath: route.create({ tutorialId: tutorial.id }),
      subPathTemplate: route.template,
      icon: TutorialIcon,
      text: Tutorial.getDisplayString(tutorial),
    });
  });

  if (route.roles.includes(Role.CORRECTOR)) {
    userData.tutorialsToCorrect.forEach((tutorial) => {
      subItems.push({
        subPath: route.create({ tutorialId: tutorial.id }),
        subPathTemplate: route.template,
        icon: TutorialToCorrectIcon,
        text: Tutorial.getDisplayString(tutorial),
      });
    });
  }

  if (route.isAccessibleBySubstitute) {
    userData.substituteTutorials.forEach((tutorial) => {
      subItems.push({
        subPath: route.create({ tutorialId: tutorial.id }),
        subPathTemplate: route.template,
        icon: SubstituteTutorialIcon,
        text: Tutorial.getDisplayString(tutorial),
      });
    });
  }

  return subItems;
}
