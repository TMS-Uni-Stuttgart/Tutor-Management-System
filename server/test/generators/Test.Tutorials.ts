import { Tutorial, TutorialDTO } from 'shared/dist/model/Tutorial';
import tutorialService from '../../src/services/tutorial-service/TutorialService.class';

export async function generateTutorial(): Promise<Tutorial> {
  const tutorialToCreate: TutorialDTO = {
    startTime: '09:45:00',
    endTime: '11:15:00',
    slot: 'T1',
    dates: [new Date(Date.now()).toDateString()],
    correctorIds: [],
    tutorId: undefined,
  };

  return tutorialService.createTutorial(tutorialToCreate);
}
