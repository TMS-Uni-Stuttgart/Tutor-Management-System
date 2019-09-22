import { ScheinExam } from 'shared/dist/model/Scheinexam';
import { LoggedInUserSubstituteTutorial, Tutorial } from 'shared/dist/model/Tutorial';
import { LoggedInUser } from 'shared/dist/model/User';

interface TutorialResponse extends Omit<Tutorial, 'dates' | 'startTime' | 'endTime'> {
  dates: string[];
  startTime: string;
  endTime: string;
}

interface ScheinExamResponse extends Omit<ScheinExam, 'date'> {
  date: string;
}

export function transformLoggedInUserResponse(responseJSON: string): LoggedInUser | undefined {
  if (!responseJSON) {
    return undefined;
  }

  const { substituteTutorials, ...rest }: LoggedInUser = JSON.parse(responseJSON);
  const parsedSubstituteTutorials: LoggedInUserSubstituteTutorial[] = [];

  substituteTutorials.forEach(tutorial => {
    const { dates, ...other } = tutorial;
    const parsedDates: Date[] = dates.map(d => new Date(d));

    parsedSubstituteTutorials.push({
      ...other,
      dates: parsedDates,
    });
  });

  return {
    ...rest,
    substituteTutorials: parsedSubstituteTutorials,
  };
}

export function transformMultipleTutorialResponse(responseJSON: string): Tutorial[] {
  if (!responseJSON) {
    return [];
  }

  const response: TutorialResponse[] = JSON.parse(responseJSON);
  const tutorials: Tutorial[] = [];

  response.forEach(res => {
    tutorials.push(transformTutorialResponse(JSON.stringify(res)));
  });

  return tutorials;
}

export function transformTutorialResponse(responseJSON: string): Tutorial {
  // FIXME: Crashed if responseJSON is empty.
  const {
    dates: dateStrings,
    startTime: startTimeString,
    endTime: endTimeString,
    ...rest
  }: TutorialResponse = JSON.parse(responseJSON);
  const dates: Date[] = [];

  const startTime = new Date(startTimeString);
  const endTime = new Date(endTimeString);

  dateStrings.forEach(date => dates.push(new Date(date)));

  return {
    ...rest,
    dates,
    startTime,
    endTime,
  };
}

export function transformMultipleScheinExamResponse(responseJSON: string): ScheinExam[] {
  if (!responseJSON) {
    return [];
  }

  const response: ScheinExamResponse[] = JSON.parse(responseJSON);
  const exams: ScheinExam[] = [];

  response.forEach(res => exams.push(transformScheinExamResponse(JSON.stringify(res))));

  return exams;
}

export function transformScheinExamResponse(responseJSON: string): ScheinExam {
  // FIXME: Crashed if responseJSON is empty.
  const { date, ...rest }: ScheinExamResponse = JSON.parse(responseJSON);

  return {
    ...rest,
    date: new Date(date),
  };
}
