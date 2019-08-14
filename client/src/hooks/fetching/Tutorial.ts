import { SubstituteDTO, TutorialDTO } from '../../typings/RequestDTOs';
import { Student, Tutorial, User } from '../../typings/ServerResponses';
import {
  StudentScheinCriteriaSummaryMap,
  StudentWithFetchedTeam,
  TutorialWithFetchedCorrectors,
  TutorialWithFetchedStudents,
  TutorialWithFetchedTutor,
  StudentByTutorialSlotSummaryMap,
} from '../../typings/types';
import {
  transformMultipleTutorialResponse,
  transformTutorialResponse,
} from '../../util/axiosTransforms';
import axios from './Axios';
import { fetchTeamsOfStudents } from './Student';

export async function getAllTutorials(): Promise<Tutorial[]> {
  const response = await axios.get<Tutorial[]>('tutorial', {
    transformResponse: transformMultipleTutorialResponse,
  });

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function getAllTutorialsAndFetchTutor(): Promise<TutorialWithFetchedTutor[]> {
  const tutorials = await getAllTutorials();
  const promises: Promise<TutorialWithFetchedTutor>[] = [];

  for (const tutorial of tutorials) {
    promises.push(getTutorOfTutorial(tutorial.id).then(tutor => ({ ...tutorial, tutor })));
  }

  return Promise.all(promises);
}

export async function getAllTutorialsAndFetchStudents(): Promise<TutorialWithFetchedStudents[]> {
  const tutorials = await getAllTutorialsAndFetchTutor();
  const promises: Promise<TutorialWithFetchedStudents>[] = [];

  for (const tutorial of tutorials) {
    promises.push(getStudentsOfTutorial(tutorial.id).then(students => ({ ...tutorial, students })));
  }

  return Promise.all(promises);
}

export async function getAllTutorialsAndFetchCorrectors(): Promise<
  TutorialWithFetchedCorrectors[]
> {
  const tutorials = await getAllTutorialsAndFetchTutor();
  const promises: Promise<TutorialWithFetchedCorrectors>[] = [];

  for (const tutorial of tutorials) {
    promises.push(
      getCorrectorsOfTutorial(tutorial.id).then(correctors => ({ ...tutorial, correctors }))
    );
  }

  return Promise.all(promises);
}

export async function getTutorial(id: string): Promise<Tutorial> {
  const response = await axios.get<Tutorial>(`tutorial/${id}`, {
    transformResponse: transformTutorialResponse,
  });

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function getTutorialAndFetchTutor(id: string): Promise<TutorialWithFetchedTutor> {
  const tutorial = await getTutorial(id);

  return fetchTutorOfTutorial(tutorial);
}

export async function getTutorialAndFetchTutorAndStudents(
  id: string
): Promise<TutorialWithFetchedStudents> {
  const tutorial = await getTutorialAndFetchTutor(id);
  const students = await getStudentsOfTutorial(tutorial.id);

  return { ...tutorial, students };
}

export async function getTutorialAndFetchCorrectors(
  id: string
): Promise<TutorialWithFetchedCorrectors> {
  const tutorial = await getTutorialAndFetchTutor(id);

  return fetchCorrectorsOfTutorial(tutorial);
}

export async function createTutorial(tutorialInformation: TutorialDTO): Promise<Tutorial> {
  const response = await axios.post<Tutorial>('tutorial', tutorialInformation, {
    transformResponse: transformTutorialResponse,
  });

  if (response.status === 201) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function createTutorialAndFetchTutor(
  tutorialInformation: TutorialDTO
): Promise<TutorialWithFetchedTutor> {
  const tutorial = await createTutorial(tutorialInformation);

  return fetchTutorOfTutorial(tutorial);
}

export async function createTutorialAndFetchCorrectors(
  tutorialInformation: TutorialDTO
): Promise<TutorialWithFetchedCorrectors> {
  const tutorial = await createTutorialAndFetchTutor(tutorialInformation);

  return fetchCorrectorsOfTutorial(tutorial);
}

export async function editTutorial(
  id: string,
  tutorialInformation: TutorialDTO
): Promise<Tutorial> {
  const response = await axios.patch<Tutorial>(`tutorial/${id}`, tutorialInformation, {
    transformResponse: transformTutorialResponse,
  });

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function editTutorialAndFetchTutor(
  id: string,
  tutorialInformation: TutorialDTO
): Promise<TutorialWithFetchedTutor> {
  const tutorial = await editTutorial(id, tutorialInformation);

  return fetchTutorOfTutorial(tutorial);
}

export async function editTutorialAndFetchCorrectors(
  id: string,
  tutorialInformation: TutorialDTO
): Promise<TutorialWithFetchedCorrectors> {
  const tutorial = await editTutorialAndFetchTutor(id, tutorialInformation);

  return fetchCorrectorsOfTutorial(tutorial);
}

export async function deleteTutorial(id: string): Promise<void> {
  const response = await axios.delete(`tutorial/${id}`);

  if (response.status !== 204) {
    return Promise.reject(`Wrong response code (${response.status}).`);
  }
}

export async function getTutorOfTutorial(id: string): Promise<User | undefined> {
  const response = await axios.get<User | undefined>(`tutorial/${id}/user`);

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function getStudentsOfTutorial(id: string): Promise<Student[]> {
  const response = await axios.get<Student[]>(`tutorial/${id}/student`);

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function getStudentsOfTutorialAndFetchTeams(
  id: string
): Promise<StudentWithFetchedTeam[]> {
  const students = await getStudentsOfTutorial(id);

  return fetchTeamsOfStudents(students);
}

export async function getScheinCriteriaSummariesOfAllStudentsOfTutorial(
  id: string
): Promise<StudentScheinCriteriaSummaryMap> {
  const response = await axios.get<StudentScheinCriteriaSummaryMap>(
    `tutorial/${id}/student/scheincriteria`
  );

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function getCorrectorsOfTutorial(id: string): Promise<User[]> {
  const response = await axios.get<User[]>(`tutorial/${id}/corrector`);

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function setSubstituteTutor(
  id: string,
  substituteDTO: SubstituteDTO
): Promise<Tutorial> {
  const response = await axios.post(`tutorial/${id}/substitute`, substituteDTO, {
    transformResponse: transformTutorialResponse,
  });

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

async function fetchTutorOfTutorial(tutorial: Tutorial): Promise<TutorialWithFetchedTutor> {
  const tutor = await getTutorOfTutorial(tutorial.id);

  return { ...tutorial, tutor };
}

async function fetchCorrectorsOfTutorial(
  tutorial: TutorialWithFetchedTutor
): Promise<TutorialWithFetchedCorrectors> {
  const correctors = await getCorrectorsOfTutorial(tutorial.id);

  return { ...tutorial, correctors };
}

export async function getScheinCriteriaSummaryOfAllStudentsWithTutorialSlots(): Promise<
  StudentByTutorialSlotSummaryMap
> {
  const response = await axios.get<StudentByTutorialSlotSummaryMap>(`scheincriteria/tutorial`);

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}
