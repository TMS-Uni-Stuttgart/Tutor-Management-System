import { Student } from 'shared/model/Student';
import { ITutorialDTO, SubstituteDTO, Tutorial } from 'shared/model/Tutorial';
import { sortByName } from 'shared/util/helpers';
import {
  StudentByTutorialSlotSummaryMap,
  TutorialWithFetchedStudents,
  TutorialWithFetchedTutor,
} from '../../typings/types';
import {
  transformMultipleTutorialResponse,
  transformTutorialResponse,
} from '../../util/axiosTransforms';
import axios from './Axios';
import { getUser } from './User';
import { getScheinCriteriaSummaryOfAllStudents } from './Scheincriteria';

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
    promises.push(fetchTutorOfTutorial(tutorial));
  }

  return Promise.all(promises);
}

export async function getAllTutorialsAndFetchStudents(): Promise<TutorialWithFetchedStudents[]> {
  const tutorials = await getAllTutorials();
  const promises: Promise<TutorialWithFetchedStudents>[] = [];

  for (const tutorial of tutorials) {
    promises.push(getStudentsOfTutorial(tutorial.id).then(students => ({ ...tutorial, students })));
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
  const tutorial = await getTutorial(id);
  const students = await getStudentsOfTutorial(tutorial.id);

  return { ...tutorial, students };
}

export async function createTutorial(tutorialInformation: ITutorialDTO): Promise<Tutorial> {
  const response = await axios.post<Tutorial>('tutorial', tutorialInformation, {
    transformResponse: transformTutorialResponse,
  });

  if (response.status === 201) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function createTutorialAndFetchTutor(
  tutorialInformation: ITutorialDTO
): Promise<TutorialWithFetchedTutor> {
  const tutorial = await createTutorial(tutorialInformation);

  return fetchTutorOfTutorial(tutorial);
}

export async function editTutorial(
  id: string,
  tutorialInformation: ITutorialDTO
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
  tutorialInformation: ITutorialDTO
): Promise<TutorialWithFetchedTutor> {
  const tutorial = await editTutorial(id, tutorialInformation);

  return fetchTutorOfTutorial(tutorial);
}

export async function deleteTutorial(id: string): Promise<void> {
  const response = await axios.delete(`tutorial/${id}`);

  if (response.status !== 204) {
    return Promise.reject(`Wrong response code (${response.status}).`);
  }
}

export async function getStudentsOfTutorial(id: string): Promise<Student[]> {
  const response = await axios.get<Student[]>(`tutorial/${id}/student`);

  if (response.status === 200) {
    return response.data.sort(sortByName);
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function setSubstituteTutor(
  id: string,
  substituteDTO: SubstituteDTO
): Promise<Tutorial> {
  const response = await axios.put(`tutorial/${id}/substitute`, substituteDTO, {
    transformResponse: transformTutorialResponse,
  });

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

async function fetchTutorOfTutorial(tutorial: Tutorial): Promise<TutorialWithFetchedTutor> {
  const tutor = tutorial.tutor ? await getUser(tutorial.tutor) : undefined;

  return { ...tutorial, tutor };
}

export async function getScheinCriteriaSummaryOfAllStudentsWithTutorialSlots(): Promise<
  StudentByTutorialSlotSummaryMap
> {
  const data: StudentByTutorialSlotSummaryMap = {};
  const [tutorials, summaries] = await Promise.all([
    getAllTutorials(),
    getScheinCriteriaSummaryOfAllStudents(),
  ]);

  Object.entries(summaries).forEach(([studentId, summary]) => {
    tutorials.forEach(tutorial => {
      if (tutorial.students.findIndex(id => id === studentId) !== -1) {
        const key: string = tutorial.slot.toString();

        if (!data[key]) {
          data[key] = [];
        }

        data[key].push(summary);
      }
    });
  });

  return data;
}
