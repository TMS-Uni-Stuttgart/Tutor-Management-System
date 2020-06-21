import {
  AccountConvert as SubstituteTutorialIcon,
  CheckboxMarkedCircleOutline as TutorialToCorrectIcon,
  Teach as TutorialIcon,
} from 'mdi-material-ui';
import { Role } from '../../../../../server/src/shared/model/Role';
import { LoggedInUser } from '../../../model/LoggedInUser';
import { Tutorial } from '../../../model/Tutorial';
import { getTutorialRelatedPath } from '../../../routes/Routing.helpers';
import { RouteType } from '../../../routes/Routing.routes';
import { RailSubItemProps } from './RailSubItem';

export function getSubItems(route: RouteType, userData: LoggedInUser): RailSubItemProps[] {
  const subItems: RailSubItemProps[] = [];

  userData.tutorials.forEach((tutorial) => {
    subItems.push({
      subPath: getTutorialRelatedPath(route, tutorial.id),
      icon: TutorialIcon,
      text: Tutorial.getDisplayString(tutorial),
    });
  });

  if (route.roles.includes(Role.CORRECTOR)) {
    userData.tutorialsToCorrect.forEach((tutorial) => {
      subItems.push({
        subPath: getTutorialRelatedPath(route, tutorial.id),
        icon: TutorialToCorrectIcon,
        text: Tutorial.getDisplayString(tutorial),
      });
    });
  }

  if (route.isAccessibleBySubstitute) {
    userData.substituteTutorials.forEach((tutorial) => {
      subItems.push({
        subPath: getTutorialRelatedPath(route, tutorial.id),
        icon: SubstituteTutorialIcon,
        text: Tutorial.getDisplayString(tutorial),
      });
    });
  }

  return subItems;
}
