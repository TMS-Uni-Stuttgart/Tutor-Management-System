import { IScheinExam } from 'shared/model/Scheinexam';
import { LoggedInUserSubstituteTutorial, ITutorial } from 'shared/model/Tutorial';
import { ILoggedInUser } from 'shared/model/User';

interface TutorialResponse extends Omit<ITutorial, 'dates' | 'startTime' | 'endTime'> {
  dates: string[];
  startTime: string;
  endTime: string;
}

interface ScheinExamResponse extends Omit<IScheinExam, 'date'> {
  date: string;
}

export function transformLoggedInUserResponse(responseJSON: string): ILoggedInUser | undefined {
  if (!responseJSON) {
    return undefined;
  }

  const { substituteTutorials, ...rest }: ILoggedInUser = JSON.parse(responseJSON);
  const parsedSubstituteTutorials: LoggedInUserSubstituteTutorial[] = [];

  substituteTutorials.forEach(tutorial => {
    const { dates, ...other } = tutorial;

    parsedSubstituteTutorials.push({
      ...other,
      dates,
    });
  });

  return {
    ...rest,
    substituteTutorials: parsedSubstituteTutorials,
  };
}

export function transformMultipleTutorialResponse(responseJSON: string): ITutorial[] {
  if (!responseJSON) {
    return [];
  }

  const response: TutorialResponse[] = JSON.parse(responseJSON);
  const tutorials: ITutorial[] = [];

  response.forEach(res => {
    tutorials.push(transformTutorialResponse(JSON.stringify(res)));
  });

  return tutorials;
}

export function transformTutorialResponse(responseJSON: string): ITutorial {
  // FIXME: Crashes if responseJSON is empty.
  const {
    dates,
    startTime: startTimeString,
    endTime: endTimeString,
    ...rest
  }: TutorialResponse = JSON.parse(responseJSON);

  const startTime = new Date(startTimeString);
  const endTime = new Date(endTimeString);

  return {
    ...rest,
    dates,
    startTime,
    endTime,
  };
}

export function transformMultipleScheinExamResponse(responseJSON: string): IScheinExam[] {
  if (!responseJSON) {
    return [];
  }

  const response: ScheinExamResponse[] = JSON.parse(responseJSON);
  const exams: IScheinExam[] = [];

  response.forEach(res => exams.push(transformScheinExamResponse(JSON.stringify(res))));

  return exams;
}

export function transformScheinExamResponse(responseJSON: string): IScheinExam {
  // FIXME: Crashed if responseJSON is empty.
  const { date, ...rest }: ScheinExamResponse = JSON.parse(responseJSON);

  return {
    ...rest,
    date: new Date(date),
  };
}
